// Export Reports Edge Function
// Supabase Edge Function for generating and exporting reports

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { reportType, format, filters } = await req.json()

    console.log(`📊 Generating ${reportType} report in ${format} format`)

    let reportData
    switch (reportType) {
      case 'attendance':
        reportData = await generateAttendanceReport(supabaseClient, filters)
        break
      case 'timetable':
        reportData = await generateTimetableReport(supabaseClient, filters)
        break
      case 'teacher-workload':
        reportData = await generateTeacherWorkloadReport(supabaseClient, filters)
        break
      case 'room-utilization':
        reportData = await generateRoomUtilizationReport(supabaseClient, filters)
        break
      case 'student-performance':
        reportData = await generateStudentPerformanceReport(supabaseClient, filters)
        break
      default:
        throw new Error(`Unknown report type: ${reportType}`)
    }

    let response
    switch (format) {
      case 'csv':
        response = generateCSV(reportData)
        break
      case 'pdf':
        response = await generatePDF(reportData, reportType)
        break
      case 'json':
        response = JSON.stringify(reportData)
        break
      default:
        response = JSON.stringify(reportData)
    }

    const headers = {
      ...corsHeaders,
      'Content-Type': format === 'csv' ? 'text/csv' : 
                     format === 'pdf' ? 'application/pdf' : 'application/json',
      'Content-Disposition': `attachment; filename="${reportType}-report.${format}"`
    }

    return new Response(response, { headers, status: 200 })

  } catch (error) {
    console.error('❌ Report generation error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function generateAttendanceReport(supabase, filters) {
  const { startDate, endDate, groupId, subjectId } = filters

  let query = supabase
    .from('attendance_records')
    .select(`
      *,
      students(name, student_id),
      timetable_slots(
        subjects(name, code),
        teachers(name),
        classrooms(name),
        student_groups(name)
      )
    `)
    .gte('date', startDate)
    .lte('date', endDate)

  if (groupId) query = query.eq('timetable_slots.group_id', groupId)
  if (subjectId) query = query.eq('timetable_slots.subject_id', subjectId)

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw error

  return {
    title: 'Attendance Report',
    dateRange: `${startDate} to ${endDate}`,
    totalRecords: data.length,
    data: data.map(record => ({
      date: record.date,
      student: record.students?.name,
      studentId: record.students?.student_id,
      subject: record.timetable_slots?.subjects?.name,
      subjectCode: record.timetable_slots?.subjects?.code,
      teacher: record.timetable_slots?.teachers?.name,
      status: record.status,
      markedAt: record.marked_at,
      method: record.method
    }))
  }
}

async function generateTimetableReport(supabase, filters) {
  const { groupId, academicYear, semester } = filters

  let query = supabase
    .from('timetable_slots')
    .select(`
      *,
      subjects(name, code, credits),
      teachers(name, specialization),
      classrooms(name, capacity, room_type),
      student_groups(name, program, size),
      timetables(name, algorithm_used, status)
    `)

  if (groupId) query = query.eq('group_id', groupId)
  if (academicYear) query = query.eq('timetables.academic_year', academicYear)
  if (semester) query = query.eq('timetables.semester', semester)

  const { data, error } = await query.order('day_of_week').order('start_time')

  if (error) throw error

  return {
    title: 'Timetable Report',
    academicYear,
    semester,
    totalSlots: data.length,
    data: data.map(slot => ({
      day: getDayName(slot.day_of_week),
      startTime: slot.start_time,
      endTime: slot.end_time,
      subject: slot.subjects?.name,
      subjectCode: slot.subjects?.code,
      credits: slot.subjects?.credits,
      teacher: slot.teachers?.name,
      classroom: slot.classrooms?.name,
      group: slot.student_groups?.name,
      algorithm: slot.timetables?.algorithm_used
    }))
  }
}

async function generateTeacherWorkloadReport(supabase, filters) {
  const { academicYear, semester } = filters

  const { data, error } = await supabase
    .from('timetable_slots')
    .select(`
      teachers(id, name, specialization, max_hours_per_week),
      subjects(credits)
    `)
    .eq('timetables.academic_year', academicYear || '2024-25')
    .eq('timetables.semester', semester || 1)

  if (error) throw error

  const workloadMap = new Map()

  data.forEach(slot => {
    const teacherId = slot.teachers?.id
    if (!teacherId) return

    if (!workloadMap.has(teacherId)) {
      workloadMap.set(teacherId, {
        teacher: slot.teachers.name,
        specialization: slot.teachers.specialization,
        maxHours: slot.teachers.max_hours_per_week,
        totalHours: 0,
        subjects: new Set()
      })
    }

    const workload = workloadMap.get(teacherId)
    workload.totalHours += 1 // Each slot is 1 hour
    workload.subjects.add(slot.subjects?.credits || 0)
  })

  return {
    title: 'Teacher Workload Report',
    academicYear,
    semester,
    data: Array.from(workloadMap.values()).map(workload => ({
      teacher: workload.teacher,
      specialization: workload.specialization,
      maxHours: workload.maxHours,
      assignedHours: workload.totalHours,
      utilizationPercentage: ((workload.totalHours / workload.maxHours) * 100).toFixed(2),
      status: workload.totalHours > workload.maxHours ? 'Overloaded' : 
              workload.totalHours < workload.maxHours * 0.7 ? 'Underutilized' : 'Optimal'
    }))
  }
}

async function generateRoomUtilizationReport(supabase, filters) {
  const { academicYear, semester } = filters

  const { data, error } = await supabase
    .from('timetable_slots')
    .select(`
      classrooms(id, name, capacity, room_type),
      day_of_week,
      start_time
    `)
    .eq('timetables.academic_year', academicYear || '2024-25')
    .eq('timetables.semester', semester || 1)

  if (error) throw error

  const utilizationMap = new Map()
  const totalPossibleSlots = 5 * 6 // 5 days * 6 time slots

  data.forEach(slot => {
    const roomId = slot.classrooms?.id
    if (!roomId) return

    if (!utilizationMap.has(roomId)) {
      utilizationMap.set(roomId, {
        room: slot.classrooms.name,
        capacity: slot.classrooms.capacity,
        type: slot.classrooms.room_type,
        usedSlots: 0
      })
    }

    utilizationMap.get(roomId).usedSlots++
  })

  return {
    title: 'Room Utilization Report',
    academicYear,
    semester,
    data: Array.from(utilizationMap.values()).map(room => ({
      room: room.room,
      capacity: room.capacity,
      type: room.type,
      usedSlots: room.usedSlots,
      totalPossibleSlots,
      utilizationPercentage: ((room.usedSlots / totalPossibleSlots) * 100).toFixed(2),
      status: room.usedSlots / totalPossibleSlots > 0.8 ? 'High Usage' :
              room.usedSlots / totalPossibleSlots < 0.3 ? 'Low Usage' : 'Moderate Usage'
    }))
  }
}

async function generateStudentPerformanceReport(supabase, filters) {
  const { startDate, endDate, groupId } = filters

  let query = supabase
    .from('attendance_records')
    .select(`
      students(id, name, student_id, group_name),
      status,
      date,
      timetable_slots(subjects(name, credits))
    `)
    .gte('date', startDate)
    .lte('date', endDate)

  if (groupId) {
    query = query.eq('students.group_name', groupId)
  }

  const { data, error } = await query

  if (error) throw error

  const performanceMap = new Map()

  data.forEach(record => {
    const studentId = record.students?.id
    if (!studentId) return

    if (!performanceMap.has(studentId)) {
      performanceMap.set(studentId, {
        student: record.students.name,
        studentId: record.students.student_id,
        group: record.students.group_name,
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      })
    }

    const performance = performanceMap.get(studentId)
    performance.totalClasses++
    performance[record.status]++
  })

  return {
    title: 'Student Performance Report',
    dateRange: `${startDate} to ${endDate}`,
    data: Array.from(performanceMap.values()).map(performance => ({
      student: performance.student,
      studentId: performance.studentId,
      group: performance.group,
      totalClasses: performance.totalClasses,
      present: performance.present,
      absent: performance.absent,
      late: performance.late,
      excused: performance.excused,
      attendancePercentage: ((performance.present / performance.totalClasses) * 100).toFixed(2),
      status: (performance.present / performance.totalClasses) >= 0.75 ? 'Good' :
              (performance.present / performance.totalClasses) >= 0.60 ? 'Average' : 'Poor'
    }))
  }
}

function generateCSV(reportData) {
  if (!reportData.data || reportData.data.length === 0) {
    return 'No data available'
  }

  const headers = Object.keys(reportData.data[0])
  const csvRows = [headers.join(',')]

  reportData.data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    })
    csvRows.push(values.join(','))
  })

  return csvRows.join('\n')
}

async function generatePDF(reportData, reportType) {
  // Simple HTML-based PDF generation for edge function
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportData.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .summary { background-color: #f9f9f9; padding: 10px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>${reportData.title}</h1>
      ${reportData.dateRange ? `<div class="summary">Date Range: ${reportData.dateRange}</div>` : ''}
      ${reportData.totalRecords ? `<div class="summary">Total Records: ${reportData.totalRecords}</div>` : ''}
      
      <table>
        <thead>
          <tr>
            ${reportData.data.length > 0 ? Object.keys(reportData.data[0]).map(key => `<th>${key}</th>`).join('') : ''}
          </tr>
        </thead>
        <tbody>
          ${reportData.data.map(row => 
            `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  // In a real implementation, you would use a PDF library here
  // For now, return the HTML content
  return html
}

function getDayName(dayNumber) {
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayNumber] || 'Unknown'
}
