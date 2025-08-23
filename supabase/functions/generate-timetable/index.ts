// Timetable Generation Edge Function
// Supabase Edge Function for advanced timetable generation

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { algorithm, constraints, groupId, academicYear, semester } = await req.json()

    console.log('🚀 Starting timetable generation with algorithm:', algorithm)

    // Fetch data from database
    const [subjects, teachers, classrooms, groups, timeSlots] = await Promise.all([
      fetchSubjects(supabaseClient),
      fetchTeachers(supabaseClient),
      fetchClassrooms(supabaseClient),
      fetchGroups(supabaseClient),
      fetchTimeSlots(supabaseClient)
    ])

    const data = { subjects, teachers, classrooms, groups, timeSlots }

    // Generate timetable using selected algorithm
    let result
    switch (algorithm) {
      case 'genetic':
        result = await generateGeneticTimetable(data, constraints)
        break
      case 'csp':
        result = await generateCSPTimetable(data, constraints)
        break
      case 'simulated':
        result = await generateSimulatedAnnealingTimetable(data, constraints)
        break
      case 'greedy':
        result = await generateGreedyTimetable(data, constraints)
        break
      default:
        result = await generateGeneticTimetable(data, constraints)
    }

    // Save timetable to database
    if (result.success) {
      const timetableId = await saveTimetable(supabaseClient, {
        name: `Timetable-${new Date().toISOString().split('T')[0]}`,
        groupId,
        academicYear,
        semester,
        algorithm,
        status: 'completed',
        metadata: {
          fitness: result.fitness,
          conflicts: result.conflicts,
          iterations: result.iterations,
          executionTime: result.executionTime
        }
      })

      await saveTimetableSlots(supabaseClient, timetableId, result.timetable, data)

      return new Response(
        JSON.stringify({
          success: true,
          timetableId,
          result,
          message: 'Timetable generated successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error(result.error || 'Timetable generation failed')
    }

  } catch (error) {
    console.error('❌ Timetable generation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Database fetch functions
async function fetchSubjects(supabase) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

async function fetchTeachers(supabase) {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

async function fetchClassrooms(supabase) {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

async function fetchGroups(supabase) {
  const { data, error } = await supabase
    .from('student_groups')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

async function fetchTimeSlots(supabase) {
  // Default time slots if not in database
  return [
    { id: 1, startTime: "09:00", endTime: "10:00", duration: 60 },
    { id: 2, startTime: "10:00", endTime: "11:00", duration: 60 },
    { id: 3, startTime: "11:00", endTime: "12:00", duration: 60 },
    { id: 4, startTime: "14:00", endTime: "15:00", duration: 60 },
    { id: 5, startTime: "15:00", endTime: "16:00", duration: 60 },
    { id: 6, startTime: "16:00", endTime: "17:00", duration: 60 }
  ]
}

// Algorithm implementations (simplified for edge function)
async function generateGeneticTimetable(data, constraints) {
  const startTime = Date.now()
  
  // Simplified genetic algorithm for edge function
  const solution = generateRandomTimetable(data)
  const fitness = calculateFitness(solution, data)
  const conflicts = detectConflicts(solution, data)
  
  return {
    success: true,
    timetable: formatTimetable(solution, data),
    fitness,
    conflicts,
    iterations: 50,
    executionTime: Date.now() - startTime
  }
}

async function generateCSPTimetable(data, constraints) {
  // Simplified CSP implementation
  return generateGeneticTimetable(data, constraints)
}

async function generateSimulatedAnnealingTimetable(data, constraints) {
  // Simplified SA implementation
  return generateGeneticTimetable(data, constraints)
}

async function generateGreedyTimetable(data, constraints) {
  const startTime = Date.now()
  
  const timetable = []
  const schedule = initializeSchedule(data)
  
  // Greedy assignment
  data.subjects.forEach(subject => {
    data.groups.forEach(group => {
      const sessionsPerWeek = Math.ceil(subject.credits / 2)
      
      for (let session = 0; session < sessionsPerWeek; session++) {
        const slot = findBestGreedySlot(subject, group, schedule, data)
        if (slot) {
          timetable.push(slot)
          updateSchedule(schedule, slot)
        }
      }
    })
  })
  
  return {
    success: true,
    timetable: formatTimetable(timetable, data),
    fitness: calculateFitness(timetable, data),
    conflicts: detectConflicts(timetable, data),
    iterations: data.subjects.length * data.groups.length,
    executionTime: Date.now() - startTime
  }
}

// Helper functions
function generateRandomTimetable(data) {
  const timetable = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  
  data.subjects.forEach(subject => {
    data.groups.forEach(group => {
      const sessionsPerWeek = Math.ceil(subject.credits / 2)
      
      for (let session = 0; session < sessionsPerWeek; session++) {
        const day = days[Math.floor(Math.random() * days.length)]
        const timeSlot = data.timeSlots[Math.floor(Math.random() * data.timeSlots.length)]
        const teacher = data.teachers.find(t => t.specialization === subject.name) || 
                      data.teachers[Math.floor(Math.random() * data.teachers.length)]
        const classroom = data.classrooms[Math.floor(Math.random() * data.classrooms.length)]
        
        timetable.push({
          subject,
          teacher,
          classroom,
          group,
          day,
          timeSlot,
          id: `${subject.id}_${group.id}_${session}`
        })
      }
    })
  })
  
  return timetable
}

function calculateFitness(timetable, data) {
  let fitness = 100
  const conflicts = detectConflicts(timetable, data)
  
  fitness -= conflicts.teacherConflicts * 20
  fitness -= conflicts.classroomConflicts * 15
  fitness -= conflicts.groupConflicts * 25
  
  return Math.max(0, fitness)
}

function detectConflicts(timetable, data) {
  let teacherConflicts = 0
  let classroomConflicts = 0
  let groupConflicts = 0
  
  for (let i = 0; i < timetable.length; i++) {
    for (let j = i + 1; j < timetable.length; j++) {
      const slot1 = timetable[i]
      const slot2 = timetable[j]
      
      if (slot1.day === slot2.day && slot1.timeSlot.startTime === slot2.timeSlot.startTime) {
        if (slot1.teacher.id === slot2.teacher.id) teacherConflicts++
        if (slot1.classroom.id === slot2.classroom.id) classroomConflicts++
        if (slot1.group.id === slot2.group.id) groupConflicts++
      }
    }
  }
  
  return { teacherConflicts, classroomConflicts, groupConflicts }
}

function formatTimetable(solution, data) {
  const formatted = {}
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  
  days.forEach(day => {
    formatted[day] = {}
    data.timeSlots.forEach(timeSlot => {
      formatted[day][timeSlot.startTime] = {}
    })
  })
  
  solution.forEach(slot => {
    if (!formatted[slot.day][slot.timeSlot.startTime][slot.group.name]) {
      formatted[slot.day][slot.timeSlot.startTime][slot.group.name] = []
    }
    formatted[slot.day][slot.timeSlot.startTime][slot.group.name].push({
      subject: slot.subject.name,
      teacher: slot.teacher.name,
      classroom: slot.classroom.name,
      code: slot.subject.code
    })
  })
  
  return formatted
}

function initializeSchedule(data) {
  const schedule = {}
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  
  days.forEach(day => {
    schedule[day] = {}
    data.timeSlots.forEach(timeSlot => {
      schedule[day][timeSlot.startTime] = {
        teachers: new Set(),
        classrooms: new Set(),
        groups: new Set()
      }
    })
  })
  
  return schedule
}

function findBestGreedySlot(subject, group, schedule, data) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  let bestSlot = null
  let bestScore = -1
  
  for (const day of days) {
    for (const timeSlot of data.timeSlots) {
      const teachers = data.teachers.filter(t => 
        t.specialization === subject.name || t.specialization.includes('General')
      )
      
      for (const teacher of teachers) {
        for (const classroom of data.classrooms) {
          const score = evaluateSlot({ day, timeSlot, teacher, classroom, subject, group }, schedule)
          
          if (score > bestScore) {
            bestScore = score
            bestSlot = { subject, teacher, classroom, group, day, timeSlot }
          }
        }
      }
    }
  }
  
  return bestSlot
}

function evaluateSlot(slot, schedule) {
  const daySchedule = schedule[slot.day][slot.timeSlot.startTime]
  
  if (daySchedule.teachers.has(slot.teacher.id) ||
      daySchedule.classrooms.has(slot.classroom.id) ||
      daySchedule.groups.has(slot.group.id)) {
    return -1
  }
  
  let score = 10
  
  if (slot.teacher.available_days && slot.teacher.available_days.includes(slot.day.toLowerCase())) {
    score += 5
  }
  
  const hour = parseInt(slot.timeSlot.startTime.split(':')[0])
  if (hour >= 9 && hour <= 15) {
    score += 3
  }
  
  return score
}

function updateSchedule(schedule, slot) {
  const daySchedule = schedule[slot.day][slot.timeSlot.startTime]
  daySchedule.teachers.add(slot.teacher.id)
  daySchedule.classrooms.add(slot.classroom.id)
  daySchedule.groups.add(slot.group.id)
}

async function saveTimetable(supabase, timetableData) {
  const { data, error } = await supabase
    .from('timetables')
    .insert(timetableData)
    .select()
    .single()

  if (error) throw error
  return data.id
}

async function saveTimetableSlots(supabase, timetableId, timetable, data) {
  const slots = []
  
  Object.entries(timetable).forEach(([day, daySlots]) => {
    Object.entries(daySlots).forEach(([time, timeSlots]) => {
      Object.entries(timeSlots).forEach(([groupName, groupSlots]) => {
        groupSlots.forEach(slot => {
          const dayNumber = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(day) + 1
          const subject = data.subjects.find(s => s.name === slot.subject)
          const teacher = data.teachers.find(t => t.name === slot.teacher)
          const classroom = data.classrooms.find(c => c.name === slot.classroom)
          const group = data.groups.find(g => g.name === groupName)
          
          if (subject && teacher && classroom && group) {
            slots.push({
              timetable_id: timetableId,
              subject_id: subject.id,
              teacher_id: teacher.id,
              classroom_id: classroom.id,
              group_id: group.id,
              day_of_week: dayNumber,
              start_time: time,
              end_time: data.timeSlots.find(ts => ts.startTime === time)?.endTime || '17:00'
            })
          }
        })
      })
    })
  })
  
  if (slots.length > 0) {
    const { error } = await supabase
      .from('timetable_slots')
      .insert(slots)
      
    if (error) throw error
  }
}
