
// src/services/mockDatabase.js 
class MockDatabase {
  constructor() {
    // Initialize with some sample data
    this.applications = [
      { 
        id: 1, 
        studentId: 'student@test.com', 
        student: 'John Student', 
        studentEmail: 'student@test.com', 
        courseId: 1, 
        course: 'Computer Science', 
        institution: 'National University of Lesotho',
        faculty: 'Faculty of Science & Technology',
        status: 'pending', 
        appliedDate: '2024-01-15',
        applicationId: 'APP-1001'
      }
    ];
    
    this.courses = [
      {
        id: 1,
        name: "Computer Science",
        institution: "National University of Lesotho", 
        faculty: "Faculty of Science & Technology",
        requirements: "Mathematics & Physical Science with minimum B grade",
        duration: "4 years",
        seats: 50,
        tuition: "M25,000 per year",
        deadline: "2024-03-31"
      },
      {
        id: 2,
        name: "Business Administration",
        institution: "Limkokwing University",
        faculty: "Faculty of Business", 
        requirements: "Commerce subjects with minimum C grade",
        duration: "3 years",
        seats: 40,
        tuition: "M30,000 per year",
        deadline: "2024-04-15"
      },
      {
        id: 3,
        name: "Electrical Engineering",
        institution: "National University of Lesotho",
        faculty: "Faculty of Engineering",
        requirements: "Mathematics, Physics & Chemistry with minimum B grade",
        duration: "4 years", 
        seats: 35,
        tuition: "M28,000 per year",
        deadline: "2024-03-31"
      }
    ];

    this.documents = [];
    this.studentProfiles = [];
  }

  // STUDENT METHODS
  getStudentApplications(studentEmail) {
    return this.applications.filter(app => app.studentEmail === studentEmail);
  }

  applyToCourse(applicationData) {
    const newApplication = {
      id: this.applications.length + 1,
      ...applicationData,
      status: 'pending',
      appliedDate: new Date().toLocaleDateString(),
      applicationId: `APP-${Date.now()}`
    };
    
    this.applications.push(newApplication);
    return newApplication;
  }

  // ADD THIS MISSING METHOD!
  getStudentDocuments(studentEmail) {
    return this.documents.filter(doc => doc.studentEmail === studentEmail);
  }

  uploadDocument(documentData) {
    const newDocument = {
      id: this.documents.length + 1,
      ...documentData,
      uploadedAt: new Date().toLocaleDateString(),
      status: 'verified',
      uploaded: true
    };
    
    this.documents.push(newDocument);
    return newDocument;
  }

  // INSTITUTE METHODS
  getInstituteApplications(institutionName) {
    return this.applications.filter(app => app.institution === institutionName);
  }

  updateApplicationStatus(appId, status) {
    const application = this.applications.find(app => app.id === appId);
    if (application) {
      application.status = status;
      application.updatedDate = new Date().toLocaleDateString();
      return application;
    }
    return null;
  }

  getCoursesByInstitution(institutionName) {
    return this.courses.filter(course => course.institution === institutionName);
  }

  getAllCourses() {
    return this.courses;
  }

  // Get application statistics
  getApplicationStats(institutionName) {
    const instituteApps = this.getInstituteApplications(institutionName);
    return {
      total: instituteApps.length,
      pending: instituteApps.filter(app => app.status === 'pending').length,
      admitted: instituteApps.filter(app => app.status === 'admitted').length,
      rejected: instituteApps.filter(app => app.status === 'rejected').length
    };
  }
}

// Create a singleton instance
export const mockDB = new MockDatabase();