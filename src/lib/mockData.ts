import type { Scholar, Mentor, Project, MentorRequest, User, Milestone, WorkLog, WorkLogComment } from "./types";

export const DEMO_USERS: (User & { password: string })[] = [
  { id: "u-c1", email: "consultant@athenaeducation.co.in", password: "minerva2024", name: "Riya Mehta", role: "consultant" },
  { id: "u-m1", email: "mentor@athenaeducation.co.in", password: "minerva2024", name: "Dr. Arjun Kapoor", role: "mentor", linkedMentorId: "m-1" },
  { id: "u-s1", email: "scholar@athenaeducation.co.in", password: "minerva2024", name: "Aanya Sharma", role: "scholar", linkedScholarId: "s-1" },
  { id: "u-a1", email: "admin@athenaeducation.co.in", password: "admin2024", name: "Admin Office", role: "admin" },
];

export const SEED_SCHOLARS: Scholar[] = [
  {
    id: "s-1", name: "Aanya Sharma", grade: "11", school: "Cathedral & John Connon, Mumbai",
    intendedMajor: "Biomedical Engineering",
    interests: ["Wearable tech", "Rehabilitation", "Healthcare equity", "Robotics"],
    pastProjects: ["Arduino-based grip strength tracker", "Volunteered at SPJ Sadhana school for differently abled"],
    collegeTargets: ["MIT", "Johns Hopkins", "Stanford", "Duke"],
    track: "Minerva", linkedUserId: "u-s1",
  },
  {
    id: "s-2", name: "Vivaan Khurana", grade: "10", school: "Dhirubhai Ambani International, Mumbai",
    intendedMajor: "Computer Science",
    interests: ["AI/ML", "Computer vision", "Smart agriculture"],
    pastProjects: ["Plant disease classifier (CNN)", "Hackathon: traffic flow simulator"],
    collegeTargets: ["Stanford", "CMU", "UC Berkeley", "Princeton"],
    track: "Minerva",
  },
  {
    id: "s-3", name: "Ishita Reddy", grade: "11", school: "Oakridge International, Hyderabad",
    intendedMajor: "Public Health Policy",
    interests: ["Healthcare access", "Policy", "Community research", "Data ethics"],
    pastProjects: ["Survey study on rural maternal health", "Op-ed in school journal"],
    collegeTargets: ["Harvard", "Yale", "Brown", "Georgetown"],
    track: "Pangea",
  },
  {
    id: "s-4", name: "Kabir Singh", grade: "9", school: "The Doon School, Dehradun",
    intendedMajor: "Mechanical Engineering",
    interests: ["Drones", "Aerospace", "CAD"],
    pastProjects: ["Built quadcopter from kit", "School robotics club lead"],
    collegeTargets: ["MIT", "Caltech", "Georgia Tech"],
    track: "Unassigned",
  },
  {
    id: "s-5", name: "Meera Iyer", grade: "12", school: "Lady Andal, Chennai",
    intendedMajor: "Environmental Science",
    interests: ["Air quality", "Climate policy", "Urban planning"],
    pastProjects: ["Air-quality data dashboard for Chennai", "School green council"],
    collegeTargets: ["Yale", "Columbia", "UCLA"],
    track: "Pangea",
  },
  {
    id: "s-6", name: "Rohan Banerjee", grade: "11", school: "La Martiniere, Kolkata",
    intendedMajor: "Electrical Engineering",
    interests: ["IoT", "Embedded systems", "Smart cities"],
    pastProjects: ["ESP32 home energy monitor"],
    collegeTargets: ["Cornell", "UIUC", "Purdue"],
    track: "Minerva",
  },
];

export const SEED_MENTORS: Mentor[] = [
  {
    id: "m-1", name: "Dr. Arjun Kapoor", designation: "Postdoctoral Researcher", organization: "IIT Bombay — Biomedical Lab",
    domains: ["Biomedical", "Wearable sensors", "Rehabilitation tech"],
    subExpertise: ["EMG signal processing", "ESP32 firmware", "Soft robotics"],
    track: "Minerva", availabilityDays: ["Tue", "Thu", "Sat"], maxConcurrentScholars: 4,
    mode: "Hybrid", status: "active",
    bio: "PhD from IISc; 8 years building rehabilitation hardware in partnership with NGOs. Loves walking scholars through hardware-first capstones.",
    initials: "AK", linkedUserId: "u-m1",
  },
  {
    id: "m-2", name: "Prof. Sneha Iyer", designation: "Assistant Professor", organization: "BITS Pilani — CS Department",
    domains: ["AI / ML", "Computer vision", "Healthcare UX"],
    subExpertise: ["TensorFlow", "OpenCV", "Edge AI"],
    track: "Minerva", availabilityDays: ["Mon", "Wed", "Fri"], maxConcurrentScholars: 5,
    mode: "Online", status: "active",
    bio: "Published in NeurIPS workshops. Has mentored 12 ISEF qualifiers since 2022.",
    initials: "SI",
  },
  {
    id: "m-3", name: "Dr. Vikram Rao", designation: "Senior Scientist", organization: "TIFR Mumbai",
    domains: ["Physics", "Environmental science", "Data science"],
    subExpertise: ["Sensor arrays", "Statistical modelling", "Atmospheric chemistry"],
    track: "Both", availabilityDays: ["Sat", "Sun"], maxConcurrentScholars: 3,
    mode: "In-person", status: "active",
    bio: "Researches air quality monitoring at scale. Strong fit for IoT + environmental capstones.",
    initials: "VR",
  },
  {
    id: "m-4", name: "Ananya Bose", designation: "Policy Researcher", organization: "Centre for Policy Research, Delhi",
    domains: ["Policy research", "Social science", "Healthcare access"],
    subExpertise: ["Qualitative research", "Survey design", "Academic writing"],
    track: "Pangea", availabilityDays: ["Mon", "Tue", "Thu"], maxConcurrentScholars: 4,
    mode: "Online", status: "active",
    bio: "MPP from Harvard Kennedy School. Guides Pangea scholars to publication in undergrad-friendly journals.",
    initials: "AB",
  },
  {
    id: "m-5", name: "Rahul Menon", designation: "Robotics Engineer", organization: "Ather Energy",
    domains: ["Robotics", "Embedded systems", "3D printing / CAD"],
    subExpertise: ["ROS", "Mechanical design", "Motor control"],
    track: "Minerva", availabilityDays: ["Wed", "Fri", "Sun"], maxConcurrentScholars: 3,
    mode: "Hybrid", status: "active",
    bio: "Industry mentor with hands-on prototyping experience. Loves drones and exoskeletons.",
    initials: "RM",
  },
  {
    id: "m-6", name: "Dr. Priya Nair", designation: "Public Health Researcher", organization: "PHFI",
    domains: ["Healthcare access", "Policy research", "Statistics"],
    subExpertise: ["Epidemiology", "Mixed-methods research"],
    track: "Pangea", availabilityDays: ["Tue", "Thu"], maxConcurrentScholars: 3,
    mode: "Online", status: "on leave",
    bio: "DrPH from Johns Hopkins. Currently on sabbatical until Q2.",
    initials: "PN",
  },
];

export const MINERVA_TOPICS = [
  "Rehabilitation tech","Wearable sensors","Biomedical devices","Soft robotics","Exoskeleton systems",
  "AI in healthcare","Prosthetics","Human-machine interface","Smart diagnostics","Environmental monitoring",
  "Assistive tech","Sports performance tech","Drone systems","Smart agriculture","Water quality monitoring","Air quality IoT",
];

export const PANGEA_TOPICS = [
  "Accessibility & disability equity","Assistive tech policy","Biomechanics & rehab outcomes",
  "Healthcare UX research","Patient adherence studies","Community health data","AI bias in medical devices",
  "Inclusive design research","Social determinants of health","Rural healthcare access","Climate policy analysis","Urban sustainability",
];

export const TOPIC_SCOPE: Record<string, { stack: string; outcome: string; complexity: string; duration: string }> = {
  "Rehabilitation tech": {
    stack: "ESP32, Flex sensors, ADS1115 ADC, 3D printing, Python Flask, BLE/WiFi",
    outcome: "Wearable prototype → NGO clinic pilot → ISEF",
    complexity: "Medium-High", duration: "12–16 weeks",
  },
  "Environmental monitoring": {
    stack: "MQ sensors, ESP32, MQTT, ThingSpeak",
    outcome: "IoT sensor network → government data partnership",
    complexity: "Low-Medium", duration: "8–12 weeks",
  },
  "AI in healthcare": {
    stack: "Python/TensorFlow, OpenCV, Raspberry Pi, Flask API",
    outcome: "ML diagnostic tool → accuracy study → IEEE",
    complexity: "Medium-High", duration: "12–16 weeks",
  },
};

export const DEFAULT_SCOPE = {
  stack: "Domain-appropriate hardware + software toolkit, version-controlled in GitHub",
  outcome: "Working prototype with documented impact study",
  complexity: "Medium",
  duration: "10–14 weeks",
};

export const DEFAULT_MILESTONES: Milestone[] = [
  { id: "ms-1", text: "Arduino + ESP32 basics, sensor interfacing", done: false },
  { id: "ms-2", text: "CAD design in Fusion 360, 3D mould printing", done: false },
  { id: "ms-3", text: "Full hardware assembly + firmware integration", done: false },
  { id: "ms-4", text: "NGO clinic pilot, data collection", done: false },
  { id: "ms-5", text: "ISEF abstract + competition write-up", done: false },
];

export const SEED_PROJECTS: Project[] = [];
export const SEED_REQUESTS: MentorRequest[] = [];

export const EXPERTISE_TAGS = [
  "Biomedical","Wearable sensors","Rehabilitation tech","Embedded systems","AI / ML",
  "Computer vision","Robotics","IoT","3D printing / CAD","Data science","Policy research",
  "Social science","Economics","Environmental science","Soft robotics","Prosthetics",
  "Healthcare UX","Statistics","Physics","Chemistry",
];

export const WEEK_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
