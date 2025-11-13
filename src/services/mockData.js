// src/services/mockData.js
export const mockData = {
  featuredInstitutions: [
    {
      id: 1,
      name: "National University of Lesotho",
      image: "/images/nul.jpg",
      description: "Premier higher education institution in Lesotho",
      location: "Roma, Lesotho",
      established: 1945,
      courses: 120,
      students: 8000
    },
    {
      id: 2,
      name: "Limkokwing University",
      image: "/images/limkokwing.jpg", 
      description: "Creative innovation university",
      location: "Maseru, Lesotho",
      established: 2008,
      courses: 85,
      students: 5000
    },
    {
      id: 3,
      name: "Botho University",
      image: "/images/botho.jpg",
      description: "Quality education for career success",
      location: "Maseru, Lesotho", 
      established: 1997,
      courses: 65,
      students: 4000
    }
  ],

  featuredJobs: [
    {
      id: 1,
      title: "Software Developer",
      company: "Tech Solutions Lesotho",
      image: "/images/tech-solutions.jpg",
      location: "Maseru",
      salary: "M15,000 - M20,000",
      type: "Full-time",
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Marketing Manager", 
      company: "Blue Mountain Industries",
      image: "/images/blue-mountain.jpg",
      location: "Maseru",
      salary: "M12,000 - M18,000", 
      type: "Full-time",
      posted: "1 week ago"
    }
  ],

  users: {
    student: { email: "student@test.com", password: "password", role: "student", name: "John Student" },
    institute: { email: "institute@test.com", password: "password", role: "institute", name: "NUL Admin" },
    company: { email: "company@test.com", password: "password", role: "company", name: "Tech Solutions HR" },
    admin: { email: "admin@test.com", password: "password", role: "admin", name: "System Admin" }
  }
};