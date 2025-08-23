// Advanced Timetable Generation Algorithms
// Comprehensive algorithm suite for optimal timetable generation

class TimetableAlgorithms {
    constructor() {
        this.algorithms = {
            genetic: new GeneticAlgorithm(),
            csp: new ConstraintSatisfactionProblem(),
            simulated: new SimulatedAnnealing(),
            tabu: new TabuSearch(),
            greedy: new GreedyAlgorithm()
        };
    }

    async generateTimetable(data, algorithmType = 'genetic', constraints = {}) {
        console.log(`🧬 Starting ${algorithmType} algorithm for timetable generation`);
        
        try {
            const algorithm = this.algorithms[algorithmType];
            if (!algorithm) {
                throw new Error(`Algorithm ${algorithmType} not found`);
            }

            const result = await algorithm.solve(data, constraints);
            return {
                success: true,
                timetable: result.timetable,
                fitness: result.fitness,
                conflicts: result.conflicts,
                iterations: result.iterations,
                executionTime: result.executionTime,
                algorithm: algorithmType
            };
        } catch (error) {
            console.error(`❌ Algorithm ${algorithmType} failed:`, error);
            return {
                success: false,
                error: error.message,
                algorithm: algorithmType
            };
        }
    }

    compareAlgorithms(data, constraints = {}) {
        const algorithms = ['genetic', 'csp', 'simulated', 'tabu', 'greedy'];
        const results = {};

        return Promise.all(
            algorithms.map(async (alg) => {
                const start = performance.now();
                const result = await this.generateTimetable(data, alg, constraints);
                const end = performance.now();
                
                results[alg] = {
                    ...result,
                    executionTime: end - start
                };
                return results[alg];
            })
        ).then(() => results);
    }
}

// Genetic Algorithm Implementation
class GeneticAlgorithm {
    constructor() {
        this.populationSize = 50;
        this.generations = 100;
        this.mutationRate = 0.1;
        this.crossoverRate = 0.8;
        this.elitismRate = 0.1;
    }

    async solve(data, constraints) {
        const startTime = performance.now();
        let population = this.initializePopulation(data);
        let bestSolution = null;
        let bestFitness = -Infinity;
        
        for (let generation = 0; generation < this.generations; generation++) {
            // Evaluate fitness for each individual
            const fitnessScores = population.map(individual => 
                this.calculateFitness(individual, data, constraints)
            );
            
            // Track best solution
            const maxFitnessIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
            if (fitnessScores[maxFitnessIndex] > bestFitness) {
                bestFitness = fitnessScores[maxFitnessIndex];
                bestSolution = JSON.parse(JSON.stringify(population[maxFitnessIndex]));
            }
            
            // Selection, crossover, and mutation
            const newPopulation = [];
            
            // Elitism - keep best individuals
            const eliteCount = Math.floor(this.populationSize * this.elitismRate);
            const sortedIndices = fitnessScores
                .map((fitness, index) => ({ fitness, index }))
                .sort((a, b) => b.fitness - a.fitness)
                .map(item => item.index);
            
            for (let i = 0; i < eliteCount; i++) {
                newPopulation.push(JSON.parse(JSON.stringify(population[sortedIndices[i]])));
            }
            
            // Generate rest of population through crossover and mutation
            while (newPopulation.length < this.populationSize) {
                const parent1 = this.tournamentSelection(population, fitnessScores);
                const parent2 = this.tournamentSelection(population, fitnessScores);
                
                let child = Math.random() < this.crossoverRate ? 
                    this.crossover(parent1, parent2) : parent1;
                
                if (Math.random() < this.mutationRate) {
                    child = this.mutate(child, data);
                }
                
                newPopulation.push(child);
            }
            
            population = newPopulation;
            
            // Progress callback
            if (generation % 10 === 0) {
                this.updateProgress(generation, this.generations, bestFitness);
            }
        }
        
        const endTime = performance.now();
        const conflicts = this.detectConflicts(bestSolution, data);
        
        return {
            timetable: this.formatTimetable(bestSolution, data),
            fitness: bestFitness,
            conflicts: conflicts,
            iterations: this.generations,
            executionTime: endTime - startTime
        };
    }

    initializePopulation(data) {
        const population = [];
        
        for (let i = 0; i < this.populationSize; i++) {
            const individual = this.generateRandomTimetable(data);
            population.push(individual);
        }
        
        return population;
    }

    generateRandomTimetable(data) {
        const timetable = [];
        const { subjects, teachers, classrooms, groups, timeSlots } = data;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // For each subject-group combination, assign random time slots
        subjects.forEach(subject => {
            groups.forEach(group => {
                const sessionsPerWeek = Math.ceil(subject.credits / 2); // Approximate sessions
                
                for (let session = 0; session < sessionsPerWeek; session++) {
                    const day = days[Math.floor(Math.random() * days.length)];
                    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
                    const teacher = teachers.find(t => t.specialization === subject.name) || 
                                  teachers[Math.floor(Math.random() * teachers.length)];
                    const classroom = classrooms[Math.floor(Math.random() * classrooms.length)];
                    
                    timetable.push({
                        subject: subject,
                        teacher: teacher,
                        classroom: classroom,
                        group: group,
                        day: day,
                        timeSlot: timeSlot,
                        id: `${subject.id}_${group.id}_${session}`
                    });
                }
            });
        });
        
        return timetable;
    }

    calculateFitness(individual, data, constraints) {
        let fitness = 100; // Start with perfect score
        const conflicts = this.detectConflicts(individual, data);
        
        // Penalty for conflicts
        fitness -= conflicts.teacherConflicts.length * 20;
        fitness -= conflicts.classroomConflicts.length * 15;
        fitness -= conflicts.groupConflicts.length * 25;
        
        // Bonus for preferences
        individual.forEach(slot => {
            // Teacher availability bonus
            if (slot.teacher.availability && slot.teacher.availability.includes(slot.day)) {
                fitness += 5;
            }
            
            // Classroom suitability bonus
            if (slot.classroom.type === 'Computer Lab' && slot.subject.name.includes('Computer')) {
                fitness += 10;
            }
            
            // Time preference bonus (avoid early morning/late evening)
            const hour = parseInt(slot.timeSlot.startTime.split(':')[0]);
            if (hour >= 9 && hour <= 16) {
                fitness += 3;
            }
        });
        
        return Math.max(0, fitness);
    }

    detectConflicts(timetable, data) {
        const teacherConflicts = [];
        const classroomConflicts = [];
        const groupConflicts = [];
        
        for (let i = 0; i < timetable.length; i++) {
            for (let j = i + 1; j < timetable.length; j++) {
                const slot1 = timetable[i];
                const slot2 = timetable[j];
                
                if (slot1.day === slot2.day && 
                    this.timeOverlap(slot1.timeSlot, slot2.timeSlot)) {
                    
                    // Teacher conflict
                    if (slot1.teacher.id === slot2.teacher.id) {
                        teacherConflicts.push({ slot1, slot2, type: 'teacher' });
                    }
                    
                    // Classroom conflict
                    if (slot1.classroom.id === slot2.classroom.id) {
                        classroomConflicts.push({ slot1, slot2, type: 'classroom' });
                    }
                    
                    // Group conflict
                    if (slot1.group.id === slot2.group.id) {
                        groupConflicts.push({ slot1, slot2, type: 'group' });
                    }
                }
            }
        }
        
        return { teacherConflicts, classroomConflicts, groupConflicts };
    }

    timeOverlap(time1, time2) {
        const start1 = this.timeToMinutes(time1.startTime);
        const end1 = this.timeToMinutes(time1.endTime);
        const start2 = this.timeToMinutes(time2.startTime);
        const end2 = this.timeToMinutes(time2.endTime);
        
        return !(end1 <= start2 || end2 <= start1);
    }

    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    tournamentSelection(population, fitnessScores, tournamentSize = 3) {
        let best = null;
        let bestFitness = -Infinity;
        
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            if (fitnessScores[randomIndex] > bestFitness) {
                best = population[randomIndex];
                bestFitness = fitnessScores[randomIndex];
            }
        }
        
        return JSON.parse(JSON.stringify(best));
    }

    crossover(parent1, parent2) {
        const crossoverPoint = Math.floor(Math.random() * parent1.length);
        const child = [
            ...parent1.slice(0, crossoverPoint),
            ...parent2.slice(crossoverPoint)
        ];
        return child;
    }

    mutate(individual, data) {
        const mutated = JSON.parse(JSON.stringify(individual));
        const mutationIndex = Math.floor(Math.random() * mutated.length);
        
        // Random mutation: change time slot, teacher, or classroom
        const mutationType = Math.floor(Math.random() * 3);
        
        switch (mutationType) {
            case 0: // Change time slot
                mutated[mutationIndex].timeSlot = data.timeSlots[
                    Math.floor(Math.random() * data.timeSlots.length)
                ];
                break;
            case 1: // Change teacher (if available for subject)
                const suitableTeachers = data.teachers.filter(t => 
                    t.specialization === mutated[mutationIndex].subject.name);
                if (suitableTeachers.length > 0) {
                    mutated[mutationIndex].teacher = suitableTeachers[
                        Math.floor(Math.random() * suitableTeachers.length)
                    ];
                }
                break;
            case 2: // Change classroom
                mutated[mutationIndex].classroom = data.classrooms[
                    Math.floor(Math.random() * data.classrooms.length)
                ];
                break;
        }
        
        return mutated;
    }

    formatTimetable(solution, data) {
        const formatted = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        days.forEach(day => {
            formatted[day] = {};
            data.timeSlots.forEach(timeSlot => {
                formatted[day][timeSlot.startTime] = {};
            });
        });
        
        solution.forEach(slot => {
            if (!formatted[slot.day][slot.timeSlot.startTime][slot.group.name]) {
                formatted[slot.day][slot.timeSlot.startTime][slot.group.name] = [];
            }
            formatted[slot.day][slot.timeSlot.startTime][slot.group.name].push({
                subject: slot.subject.name,
                teacher: slot.teacher.name,
                classroom: slot.classroom.name,
                code: slot.subject.code
            });
        });
        
        return formatted;
    }

    updateProgress(current, total, fitness) {
        const progressElement = document.getElementById('generation-progress');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressElement && progressFill && progressText) {
            const percentage = (current / total) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Generation ${current}/${total} - Fitness: ${fitness.toFixed(2)}`;
            
            if (!progressElement.classList.contains('hidden')) {
                progressElement.classList.remove('hidden');
            }
        }
    }
}

// Constraint Satisfaction Problem Algorithm
class ConstraintSatisfactionProblem {
    async solve(data, constraints) {
        const startTime = performance.now();
        
        // Implement CSP with backtracking
        const assignment = {};
        const domains = this.initializeDomains(data);
        
        const result = this.backtrack(assignment, domains, data, constraints);
        
        const endTime = performance.now();
        
        if (result) {
            return {
                timetable: this.formatCSPSolution(result, data),
                fitness: this.calculateCSPFitness(result, data),
                conflicts: [],
                iterations: 0,
                executionTime: endTime - startTime
            };
        } else {
            throw new Error('No solution found using CSP');
        }
    }

    initializeDomains(data) {
        const domains = {};
        const variables = [];
        
        // Create variables for each subject-group combination
        data.subjects.forEach(subject => {
            data.groups.forEach(group => {
                const variable = `${subject.id}_${group.id}`;
                variables.push(variable);
                
                domains[variable] = [];
                
                // Domain: all possible (day, time, teacher, classroom) combinations
                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
                    data.timeSlots.forEach(timeSlot => {
                        data.teachers.forEach(teacher => {
                            data.classrooms.forEach(classroom => {
                                domains[variable].push({
                                    day, timeSlot, teacher, classroom, subject, group
                                });
                            });
                        });
                    });
                });
            });
        });
        
        return domains;
    }

    backtrack(assignment, domains, data, constraints) {
        if (Object.keys(assignment).length === Object.keys(domains).length) {
            return assignment; // Solution found
        }
        
        const variable = this.selectUnassignedVariable(assignment, domains);
        
        for (const value of domains[variable]) {
            if (this.isConsistent(variable, value, assignment, constraints)) {
                assignment[variable] = value;
                
                const result = this.backtrack(assignment, domains, data, constraints);
                if (result) return result;
                
                delete assignment[variable]; // Backtrack
            }
        }
        
        return null; // No solution
    }

    selectUnassignedVariable(assignment, domains) {
        // Most Constraining Variable heuristic
        const unassigned = Object.keys(domains).filter(v => !(v in assignment));
        return unassigned.reduce((best, current) => 
            domains[current].length < domains[best].length ? current : best
        );
    }

    isConsistent(variable, value, assignment, constraints) {
        // Check conflicts with existing assignments
        for (const [assignedVar, assignedValue] of Object.entries(assignment)) {
            if (this.hasConflict(value, assignedValue)) {
                return false;
            }
        }
        return true;
    }

    hasConflict(value1, value2) {
        // Same day and time
        if (value1.day === value2.day && 
            value1.timeSlot.startTime === value2.timeSlot.startTime) {
            
            // Teacher, classroom, or group conflict
            return value1.teacher.id === value2.teacher.id ||
                   value1.classroom.id === value2.classroom.id ||
                   value1.group.id === value2.group.id;
        }
        return false;
    }

    formatCSPSolution(assignment, data) {
        const formatted = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        days.forEach(day => {
            formatted[day] = {};
            data.timeSlots.forEach(timeSlot => {
                formatted[day][timeSlot.startTime] = {};
            });
        });
        
        Object.values(assignment).forEach(slot => {
            if (!formatted[slot.day][slot.timeSlot.startTime][slot.group.name]) {
                formatted[slot.day][slot.timeSlot.startTime][slot.group.name] = [];
            }
            formatted[slot.day][slot.timeSlot.startTime][slot.group.name].push({
                subject: slot.subject.name,
                teacher: slot.teacher.name,
                classroom: slot.classroom.name,
                code: slot.subject.code
            });
        });
        
        return formatted;
    }

    calculateCSPFitness(assignment, data) {
        // CSP solutions are conflict-free by design
        return 100;
    }
}

// Simulated Annealing Algorithm
class SimulatedAnnealing {
    constructor() {
        this.initialTemperature = 1000;
        this.finalTemperature = 1;
        this.coolingRate = 0.95;
        this.maxIterations = 1000;
    }

    async solve(data, constraints) {
        const startTime = performance.now();
        
        let currentSolution = this.generateInitialSolution(data);
        let currentCost = this.calculateCost(currentSolution, data);
        let bestSolution = JSON.parse(JSON.stringify(currentSolution));
        let bestCost = currentCost;
        
        let temperature = this.initialTemperature;
        let iteration = 0;
        
        while (temperature > this.finalTemperature && iteration < this.maxIterations) {
            const newSolution = this.generateNeighbor(currentSolution, data);
            const newCost = this.calculateCost(newSolution, data);
            
            const deltaE = newCost - currentCost;
            
            if (deltaE < 0 || Math.random() < Math.exp(-deltaE / temperature)) {
                currentSolution = newSolution;
                currentCost = newCost;
                
                if (newCost < bestCost) {
                    bestSolution = JSON.parse(JSON.stringify(newSolution));
                    bestCost = newCost;
                }
            }
            
            temperature *= this.coolingRate;
            iteration++;
            
            if (iteration % 100 === 0) {
                this.updateSAProgress(iteration, this.maxIterations, temperature, bestCost);
            }
        }
        
        const endTime = performance.now();
        const genetic = new GeneticAlgorithm();
        
        return {
            timetable: genetic.formatTimetable(bestSolution, data),
            fitness: 100 - bestCost,
            conflicts: genetic.detectConflicts(bestSolution, data),
            iterations: iteration,
            executionTime: endTime - startTime
        };
    }

    generateInitialSolution(data) {
        const genetic = new GeneticAlgorithm();
        return genetic.generateRandomTimetable(data);
    }

    calculateCost(solution, data) {
        const genetic = new GeneticAlgorithm();
        const conflicts = genetic.detectConflicts(solution, data);
        
        // Cost is inverse of fitness
        return 100 - genetic.calculateFitness(solution, data, {});
    }

    generateNeighbor(solution, data) {
        const neighbor = JSON.parse(JSON.stringify(solution));
        const genetic = new GeneticAlgorithm();
        
        // Apply small mutation
        return genetic.mutate(neighbor, data);
    }

    updateSAProgress(iteration, maxIterations, temperature, cost) {
        console.log(`SA Progress: ${iteration}/${maxIterations}, Temp: ${temperature.toFixed(2)}, Cost: ${cost.toFixed(2)}`);
    }
}

// Tabu Search Algorithm
class TabuSearch {
    constructor() {
        this.maxIterations = 500;
        this.tabuListSize = 20;
        this.neighborhoodSize = 10;
    }

    async solve(data, constraints) {
        const startTime = performance.now();
        
        let currentSolution = this.generateInitialSolution(data);
        let bestSolution = JSON.parse(JSON.stringify(currentSolution));
        let tabuList = [];
        
        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            const neighbors = this.generateNeighborhood(currentSolution, data);
            const bestNeighbor = this.selectBestNeighbor(neighbors, tabuList, data);
            
            currentSolution = bestNeighbor;
            
            if (this.isBetter(bestNeighbor, bestSolution, data)) {
                bestSolution = JSON.parse(JSON.stringify(bestNeighbor));
            }
            
            // Add to tabu list
            tabuList.push(this.getSolutionHash(bestNeighbor));
            if (tabuList.length > this.tabuListSize) {
                tabuList.shift();
            }
            
            if (iteration % 50 === 0) {
                console.log(`Tabu Search Progress: ${iteration}/${this.maxIterations}`);
            }
        }
        
        const endTime = performance.now();
        const genetic = new GeneticAlgorithm();
        
        return {
            timetable: genetic.formatTimetable(bestSolution, data),
            fitness: genetic.calculateFitness(bestSolution, data, {}),
            conflicts: genetic.detectConflicts(bestSolution, data),
            iterations: this.maxIterations,
            executionTime: endTime - startTime
        };
    }

    generateInitialSolution(data) {
        const genetic = new GeneticAlgorithm();
        return genetic.generateRandomTimetable(data);
    }

    generateNeighborhood(solution, data) {
        const neighbors = [];
        const genetic = new GeneticAlgorithm();
        
        for (let i = 0; i < this.neighborhoodSize; i++) {
            neighbors.push(genetic.mutate(JSON.parse(JSON.stringify(solution)), data));
        }
        
        return neighbors;
    }

    selectBestNeighbor(neighbors, tabuList, data) {
        const genetic = new GeneticAlgorithm();
        
        const validNeighbors = neighbors.filter(neighbor => 
            !tabuList.includes(this.getSolutionHash(neighbor))
        );
        
        if (validNeighbors.length === 0) {
            return neighbors[0]; // Aspiration criterion
        }
        
        return validNeighbors.reduce((best, current) => 
            genetic.calculateFitness(current, data, {}) > 
            genetic.calculateFitness(best, data, {}) ? current : best
        );
    }

    isBetter(solution1, solution2, data) {
        const genetic = new GeneticAlgorithm();
        return genetic.calculateFitness(solution1, data, {}) > 
               genetic.calculateFitness(solution2, data, {});
    }

    getSolutionHash(solution) {
        return JSON.stringify(solution.map(slot => 
            `${slot.subject.id}_${slot.group.id}_${slot.day}_${slot.timeSlot.startTime}`
        ).sort());
    }
}

// Greedy Algorithm
class GreedyAlgorithm {
    async solve(data, constraints) {
        const startTime = performance.now();
        
        const timetable = [];
        const schedule = this.initializeSchedule(data);
        
        // Sort subjects by priority (credits, constraints, etc.)
        const sortedAssignments = this.prioritizeAssignments(data);
        
        for (const assignment of sortedAssignments) {
            const slot = this.findBestSlot(assignment, schedule, data);
            if (slot) {
                timetable.push(slot);
                this.updateSchedule(schedule, slot);
            }
        }
        
        const endTime = performance.now();
        const genetic = new GeneticAlgorithm();
        
        return {
            timetable: genetic.formatTimetable(timetable, data),
            fitness: genetic.calculateFitness(timetable, data, {}),
            conflicts: genetic.detectConflicts(timetable, data),
            iterations: sortedAssignments.length,
            executionTime: endTime - startTime
        };
    }

    initializeSchedule(data) {
        const schedule = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        days.forEach(day => {
            schedule[day] = {};
            data.timeSlots.forEach(timeSlot => {
                schedule[day][timeSlot.startTime] = {
                    teachers: new Set(),
                    classrooms: new Set(),
                    groups: new Set()
                };
            });
        });
        
        return schedule;
    }

    prioritizeAssignments(data) {
        const assignments = [];
        
        data.subjects.forEach(subject => {
            data.groups.forEach(group => {
                const sessionsPerWeek = Math.ceil(subject.credits / 2);
                
                for (let session = 0; session < sessionsPerWeek; session++) {
                    assignments.push({
                        subject,
                        group,
                        session,
                        priority: subject.credits + (subject.name.includes('Lab') ? 5 : 0)
                    });
                }
            });
        });
        
        return assignments.sort((a, b) => b.priority - a.priority);
    }

    findBestSlot(assignment, schedule, data) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let bestSlot = null;
        let bestScore = -1;
        
        for (const day of days) {
            for (const timeSlot of data.timeSlots) {
                const teachers = data.teachers.filter(t => 
                    t.specialization === assignment.subject.name ||
                    t.specialization.includes('General')
                );
                
                for (const teacher of teachers) {
                    for (const classroom of data.classrooms) {
                        const score = this.evaluateSlot(
                            { day, timeSlot, teacher, classroom, ...assignment },
                            schedule
                        );
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestSlot = {
                                subject: assignment.subject,
                                teacher: teacher,
                                classroom: classroom,
                                group: assignment.group,
                                day: day,
                                timeSlot: timeSlot
                            };
                        }
                    }
                }
            }
        }
        
        return bestSlot;
    }

    evaluateSlot(slot, schedule) {
        const daySchedule = schedule[slot.day][slot.timeSlot.startTime];
        
        // Check conflicts
        if (daySchedule.teachers.has(slot.teacher.id) ||
            daySchedule.classrooms.has(slot.classroom.id) ||
            daySchedule.groups.has(slot.group.id)) {
            return -1; // Conflict
        }
        
        let score = 10; // Base score
        
        // Teacher availability bonus
        if (slot.teacher.availability && slot.teacher.availability.includes(slot.day)) {
            score += 5;
        }
        
        // Classroom suitability bonus
        if (slot.classroom.type === 'Computer Lab' && slot.subject.name.includes('Computer')) {
            score += 8;
        } else if (slot.classroom.type === 'Chemistry Lab' && slot.subject.name.includes('Chemistry')) {
            score += 8;
        }
        
        // Time preference (avoid very early or very late)
        const hour = parseInt(slot.timeSlot.startTime.split(':')[0]);
        if (hour >= 9 && hour <= 15) {
            score += 3;
        } else if (hour < 8 || hour > 17) {
            score -= 2;
        }
        
        return score;
    }

    updateSchedule(schedule, slot) {
        const daySchedule = schedule[slot.day][slot.timeSlot.startTime];
        daySchedule.teachers.add(slot.teacher.id);
        daySchedule.classrooms.add(slot.classroom.id);
        daySchedule.groups.add(slot.group.id);
    }
}

// Export the main class
window.TimetableAlgorithms = TimetableAlgorithms;

console.log('✅ Advanced Timetable Algorithms loaded successfully');
