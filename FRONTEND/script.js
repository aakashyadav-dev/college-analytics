console.log('✅ script.js loaded successfully!');

class CollegeAnalytics {
    constructor() {
        this.apiBase = 'http://localhost:5001/api';
        this.charts = {
            college: null,
            degree: null,
            course: null,
            country: null
        };
        this.currentLevel = 1;
        this.selectedType = null;
        this.selectedDegree = null;
        this.selectedCountry = null;
        this.allColleges = [];
        this.countries = [];
        this.degrees = [];
        this.init();
    }

    async init() {
        console.log('🚀 Advanced College Analytics Initializing...');
        this.showLoading('Loading application...');
        
        const isConnected = await this.testBackendConnection();
        
        if (isConnected) {
            await this.loadFilterData();
            this.setupEventListeners();
            await this.loadStatistics();
            await this.loadAllColleges();
            this.showNotification('✅ Application ready! Explore colleges by type, country, or degree.', 'success');
        }
    }

    async loadFilterData() {
        try {
            // Load countries
            const countriesResponse = await fetch(`${this.apiBase}/colleges/countries/list`);
            const countriesData = await countriesResponse.json();
            this.countries = countriesData.data || [];
            this.populateCountryFilter();

            // Load degrees
            const degreesResponse = await fetch(`${this.apiBase}/colleges/degrees/list`);
            const degreesData = await degreesResponse.json();
            this.degrees = degreesData.data || [];
            this.populateDegreeFilter();

        } catch (error) {
            console.error('❌ Error loading filter data:', error);
        }
    }

    populateCountryFilter() {
        const countryFilter = document.getElementById('countryFilter');
        countryFilter.innerHTML = '<option value="">All Countries</option>';
        this.countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
    }

    populateDegreeFilter() {
        const degreeFilter = document.getElementById('degreeFilter');
        degreeFilter.innerHTML = '<option value="">All Degrees</option>';
        this.degrees.forEach(degree => {
            const option = document.createElement('option');
            option.value = degree;
            option.textContent = degree;
            degreeFilter.appendChild(option);
        });
    }

    async testBackendConnection() {
        try {
            console.log('🔗 Testing backend connection...');
            const response = await fetch(`${this.apiBase}/health`);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            return true;
            
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.showError('Cannot connect to backend server. Please check if server is running on port 5001.');
            return false;
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Navigation
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        document.getElementById('addCollegeBtn').addEventListener('click', () => this.showAddModal());
        document.getElementById('searchBtn').addEventListener('click', () => this.searchColleges());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchColleges();
        });

        // Filters
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.hideAddModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideAddModal());
        document.getElementById('collegeForm').addEventListener('submit', (e) => this.addCollege(e));
        document.getElementById('addCourse').addEventListener('click', () => this.addCourseField());

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('addCollegeModal');
            if (event.target === modal) this.hideAddModal();
        });
    }

    async loadStatistics() {
        try {
            console.log('📊 Loading statistics...');
            const response = await fetch(`${this.apiBase}/colleges/statistics`);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            console.log('✅ Statistics loaded:', result);
            
            if (result.success) {
                this.renderCollegeTypeChart(result.data.byType);
                this.updateStatsOverview(result.data.overall, result.data.byCountry);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
            this.showError('Failed to load statistics: ' + error.message);
        }
    }

    // FIXED: Added the missing updateStatsOverview method
    updateStatsOverview(overall, byCountry) {
        console.log('📈 Updating stats overview:', overall);
        
        // Update statistics cards
        document.getElementById('totalCollegesCount').textContent = overall.totalColleges || 0;
        document.getElementById('totalStudentsCount').textContent = (overall.totalStudents || 0).toLocaleString();
        document.getElementById('avgRatingValue').textContent = (overall.avgRating || 0).toFixed(1);
        document.getElementById('countriesCount').textContent = overall.uniqueCountries ? overall.uniqueCountries.length : 0;
    }

    renderCollegeTypeChart(stats) {
        console.log('📈 Rendering college type chart:', stats);
        
        const ctx = document.getElementById('collegeChart').getContext('2d');
        if (this.charts.college) this.charts.college.destroy();

        if (!stats || stats.length === 0) {
            this.showNoDataMessage();
            return;
        }

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'];
        
        this.charts.college = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: stats.map(stat => `${stat._id} (${stat.count})`),
                datasets: [{
                    data: stats.map(stat => stat.count),
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label.split(' (')[0]}: ${value} colleges (${percentage}%)`;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const type = stats[index]._id;
                        this.showDegreeLevels(type);
                    }
                }
            }
        });
    }

    async showDegreeLevels(collegeType) {
        this.selectedType = collegeType;
        document.getElementById('selectedType').textContent = collegeType;
        
        try {
            const response = await fetch(`${this.apiBase}/colleges/type/${collegeType}`);
            const result = await response.json();
            
            if (result.success) {
                const degreeCounts = this.countDegreesByType(result.data);
                this.renderDegreeChart(degreeCounts);
                this.switchLevel(2);
            }
        } catch (error) {
            console.error('❌ Error loading degree levels:', error);
            this.showError('Failed to load degree levels: ' + error.message);
        }
    }

    countDegreesByType(colleges) {
        const degreeCounts = {};
        colleges.forEach(college => {
            college.courses?.forEach(course => {
                degreeCounts[course.level] = (degreeCounts[course.level] || 0) + 1;
            });
        });
        return Object.entries(degreeCounts).map(([level, count]) => ({ level, count }));
    }

    renderDegreeChart(degreeStats) {
        const ctx = document.getElementById('degreeChart').getContext('2d');
        if (this.charts.degree) this.charts.degree.destroy();

        const colors = ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#36A2EB'];
        
        this.charts.degree = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: degreeStats.map(stat => stat.level),
                datasets: [{
                    label: 'Number of Programs',
                    data: degreeStats.map(stat => stat.count),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw} programs available`
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const degree = degreeStats[index].level;
                        this.showCourses(this.selectedType, degree);
                    }
                }
            }
        });
    }

    async showCourses(collegeType, degree) {
        this.selectedDegree = degree;
        document.getElementById('selectedDegree').textContent = degree;
        document.getElementById('selectedType2').textContent = collegeType;

        try {
            const response = await fetch(`${this.apiBase}/colleges/degree/${degree}`);
            const result = await response.json();
            
            if (result.success) {
                const courseCounts = this.countCoursesByDegree(result.data, collegeType);
                this.renderCourseChart(courseCounts);
                this.switchLevel(3);
            }
        } catch (error) {
            console.error('❌ Error loading courses:', error);
            this.showError('Failed to load courses: ' + error.message);
        }
    }

    countCoursesByDegree(colleges, type) {
        const courseCounts = {};
        colleges.forEach(college => {
            if (college.type === type) {
                college.courses?.forEach(course => {
                    if (course.level === this.selectedDegree) {
                        courseCounts[course.name] = (courseCounts[course.name] || 0) + 1;
                    }
                });
            }
        });
        return Object.entries(courseCounts).map(([course, count]) => ({ course, count }));
    }

    renderCourseChart(courseStats) {
        const ctx = document.getElementById('courseChart').getContext('2d');
        if (this.charts.course) this.charts.course.destroy();

        this.charts.course = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: courseStats.map(stat => stat.course),
                datasets: [{
                    data: courseStats.map(stat => stat.count),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw} colleges offer this course`
                        }
                    }
                }
            }
        });
    }

    async showCountryColleges(country) {
        this.selectedCountry = country;
        document.getElementById('selectedCountry').textContent = country;

        try {
            const response = await fetch(`${this.apiBase}/colleges/country/${country}`);
            const result = await response.json();
            
            if (result.success) {
                const typeCounts = this.countTypesByCountry(result.data);
                this.renderCountryChart(typeCounts);
                this.switchLevel('country');
                this.displayCollegeDetails(result.data, `${country} Colleges`);
            }
        } catch (error) {
            console.error('❌ Error loading country data:', error);
            this.showError('Failed to load country data: ' + error.message);
        }
    }

    countTypesByCountry(colleges) {
        const typeCounts = {};
        colleges.forEach(college => {
            typeCounts[college.type] = (typeCounts[college.type] || 0) + 1;
        });
        return Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    }

    renderCountryChart(typeStats) {
        const ctx = document.getElementById('countryChart').getContext('2d');
        if (this.charts.country) this.charts.country.destroy();

        this.charts.country = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: typeStats.map(stat => stat.type),
                datasets: [{
                    data: typeStats.map(stat => stat.count),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw} colleges`
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const type = typeStats[index].type;
                        this.loadCollegesByTypeAndCountry(type, this.selectedCountry);
                    }
                }
            }
        });
    }

    switchLevel(level) {
        // Hide all levels
        document.querySelectorAll('.chart-level').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show selected level
        document.getElementById(`level${level}`).classList.add('active');
        this.currentLevel = level;
    }

    backToLevel(level) {
        this.switchLevel(level);
    }

    async applyFilters() {
        const country = document.getElementById('countryFilter').value;
        const degree = document.getElementById('degreeFilter').value;
        const type = document.getElementById('typeFilter').value;

        let url = `${this.apiBase}/colleges?`;
        const params = [];
        
        if (country) params.push(`country=${encodeURIComponent(country)}`);
        if (degree) params.push(`degree=${encodeURIComponent(degree)}`);
        if (type) params.push(`type=${encodeURIComponent(type)}`);

        if (params.length > 0) {
            url += params.join('&');
            
            try {
                this.showLoading('Applying filters...');
                const response = await fetch(url);
                const result = await response.json();
                
                if (result.success) {
                    let title = 'Filtered Results';
                    if (country) title += ` in ${country}`;
                    if (type) title += ` - ${type}`;
                    if (degree) title += ` (${degree})`;
                    
                    this.displayCollegeDetails(result.data, title);
                    this.showNotification(`Found ${result.count} colleges matching your filters`, 'success');
                }
            } catch (error) {
                console.error('❌ Error applying filters:', error);
                this.showError('Failed to apply filters: ' + error.message);
            }
        } else {
            this.showNotification('Please select at least one filter', 'info');
        }
    }

    clearFilters() {
        document.getElementById('countryFilter').value = '';
        document.getElementById('degreeFilter').value = '';
        document.getElementById('typeFilter').value = '';
        this.loadAllColleges();
        this.switchLevel(1);
    }

    async loadAllColleges() {
        try {
            const response = await fetch(`${this.apiBase}/colleges`);
            const result = await response.json();
            
            if (result.success) {
                this.allColleges = result.data;
                console.log('✅ Loaded', this.allColleges.length, 'colleges');
                this.displayCollegeDetails(this.allColleges, 'All Colleges');
            }
        } catch (error) {
            console.error('❌ Error loading colleges:', error);
        }
    }

    async searchColleges() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        
        if (!searchTerm) {
            this.showNotification('Please enter a search term', 'info');
            return;
        }

        try {
            this.showLoading(`Searching for "${searchTerm}"...`);
            
            const response = await fetch(`${this.apiBase}/colleges?search=${encodeURIComponent(searchTerm)}`);
            const result = await response.json();
            
            if (result.success) {
                const title = document.getElementById('collegeTypeTitle');
                title.textContent = `🔍 Search Results for "${searchTerm}" (${result.count})`;
                this.displayCollegeDetails(result.data, 'Search Results');
                this.showNotification(`Found ${result.count} colleges for "${searchTerm}"`, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError('Search failed: ' + error.message);
        }
    }

    displayCollegeDetails(colleges, type) {
        const detailsContainer = document.getElementById('collegeDetails');
        const title = document.getElementById('collegeTypeTitle');
        
        title.textContent = `🎯 ${type}`;
        
        if (colleges.length === 0) {
            detailsContainer.innerHTML = `
                <div class="placeholder">
                    <p>No colleges found.</p>
                </div>
            `;
            return;
        }

        detailsContainer.innerHTML = colleges.map(college => `
            <div class="college-card">
                <h3>${college.name} ${college.country ? `<span class="country-flag">🌍 ${college.country}</span>` : ''}</h3>
                <p><strong>📍 Location:</strong> ${college.location}</p>
                <p><strong>📅 Established:</strong> ${college.establishedYear}</p>
                <p><strong>👨‍🎓 Total Students:</strong> ${college.totalStudents.toLocaleString()}</p>
                <p><strong>⭐ Rating:</strong> ${college.rating}/5</p>
                <p><strong>🎓 Type:</strong> ${college.type}</p>
                ${college.description ? `<p><strong>📝 Description:</strong> ${college.description}</p>` : ''}
                ${college.contact?.email ? `<p><strong>📧 Email:</strong> <a href="mailto:${college.contact.email}" class="contact-link">${college.contact.email}</a></p>` : ''}
                ${college.contact?.phone ? `<p><strong>📞 Phone:</strong> <a href="tel:${college.contact.phone}" class="contact-link">${college.contact.phone}</a></p>` : ''}
                ${college.contact?.website ? `<p><strong>🌐 Website:</strong> <a href="${this.ensureHttp(college.contact.website)}" target="_blank" class="website-link">${college.contact.website}</a></p>` : ''}
                ${college.facilities?.length ? `<p><strong>🏢 Facilities:</strong> ${college.facilities.join(', ')}</p>` : ''}
                ${college.courses?.length ? `
                    <div class="courses-list">
                        <h4>Available Courses:</h4>
                        ${college.courses.map(course => `
                            <span class="course-tag">${course.level}: ${course.name}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Helper function to ensure website URLs have http://
    ensureHttp(url) {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    }

    async refreshData() {
        this.showNotification('🔄 Refreshing data...', 'info');
        await this.loadStatistics();
        await this.loadAllColleges();
        this.showNotification('✅ Data refreshed!', 'success');
    }

    showAddModal() {
        document.getElementById('addCollegeModal').style.display = 'block';
    }

    hideAddModal() {
        document.getElementById('addCollegeModal').style.display = 'none';
    }

    addCourseField() {
        const coursesContainer = document.getElementById('coursesContainer');
        const newCourse = document.createElement('div');
        newCourse.className = 'course-entry';
        newCourse.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Course Name:</label>
                    <input type="text" class="courseName" placeholder="e.g., Computer Science">
                </div>
                <div class="form-group">
                    <label>Degree Level:</label>
                    <select class="courseLevel">
                        <option value="">Select Level</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="MBA">MBA</option>
                        <option value="MBBS">MBBS</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="B.A">B.A</option>
                        <option value="M.A">M.A</option>
                        <option value="LLB">LLB</option>
                        <option value="LLM">LLM</option>
                        <option value="PhD">PhD</option>
                        <option value="Diploma">Diploma</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duration:</label>
                    <input type="text" class="courseDuration" placeholder="e.g., 4 years">
                </div>
                <div class="form-group">
                    <label>Seats:</label>
                    <input type="number" class="courseSeats" placeholder="Number of seats">
                </div>
            </div>
            <button type="button" class="remove-course btn-secondary" onclick="this.parentElement.remove()">× Remove</button>
        `;
        coursesContainer.appendChild(newCourse);
    }

    async addCollege(event) {
        event.preventDefault();
        const form = document.getElementById('collegeForm');
        
        // Get basic form data
        const name = document.getElementById('collegeName').value.trim();
        const type = document.getElementById('collegeType').value;
        const country = document.getElementById('collegeCountry').value.trim();
        const location = document.getElementById('collegeLocation').value.trim();
        const establishedYear = parseInt(document.getElementById('collegeEstablishedYear').value);
        const totalStudents = parseInt(document.getElementById('collegeTotalStudents').value);
        const rating = parseFloat(document.getElementById('collegeRating').value);
        const description = document.getElementById('collegeDescription').value.trim();
        const email = document.getElementById('collegeEmail').value.trim();
        const website = document.getElementById('collegeWebsite').value.trim();
        const phone = document.getElementById('collegePhone').value.trim();
        const facilitiesInput = document.getElementById('collegeFacilities').value.trim();

        // Get courses data
        const courses = [];
        document.querySelectorAll('.course-entry').forEach(entry => {
            const courseName = entry.querySelector('.courseName').value.trim();
            const courseLevel = entry.querySelector('.courseLevel').value;
            const courseDuration = entry.querySelector('.courseDuration').value.trim();
            const courseSeats = parseInt(entry.querySelector('.courseSeats').value) || 0;

            if (courseName && courseLevel) {
                courses.push({
                    name: courseName,
                    level: courseLevel,
                    duration: courseDuration,
                    seats: courseSeats
                });
            }
        });

        // Process facilities
        const facilities = facilitiesInput ? facilitiesInput.split(',').map(f => f.trim()).filter(f => f) : [];

        const formData = {
            name,
            type,
            country,
            location,
            establishedYear,
            totalStudents,
            rating,
            description,
            courses,
            facilities,
            contact: {
                email: email || undefined,
                website: website || undefined,
                phone: phone || undefined
            }
        };

        console.log('➕ Adding new college:', formData);

        try {
            this.showNotification('🔄 Adding college...', 'info');

            const response = await fetch(`${this.apiBase}/colleges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                form.reset();
                this.hideAddModal();
                await this.loadStatistics();
                await this.loadAllColleges();
                this.showNotification('✅ College added successfully!', 'success');
            } else {
                throw new Error(result.message || 'Unknown server error');
            }

        } catch (error) {
            console.error('❌ Error adding college:', error);
            this.showError('Error adding college: ' + error.message);
        }
    }

    // UI Helper Methods
    showLoading(message = 'Loading...') {
        const container = document.getElementById('collegeDetails');
        container.innerHTML = `
            <div class="placeholder">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    showNoDataMessage() {
        const container = document.getElementById('collegeDetails');
        container.innerHTML = `
            <div class="placeholder">
                <p>No data available. Please check backend connection.</p>
                <button onclick="app.refreshData()" class="btn-primary">🔄 Retry</button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showNotification('❌ ' + message, 'error');
    }
}

// Initialize the application
const app = new CollegeAnalytics();
window.app = app;

console.log('🎓 Advanced College Analytics Dashboard initialized!');