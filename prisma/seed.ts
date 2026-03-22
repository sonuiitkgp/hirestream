import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const SENTINEL_EMAIL = "arjun.mehta@example.com";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  // Idempotency check
  const existing = await prisma.user.findUnique({
    where: { email: SENTINEL_EMAIL },
  });
  if (existing) {
    console.log("Seed data already exists (sentinel user found). Skipping.");
    return;
  }

  console.log("Seeding database...");
  const hashedPassword = await hash("password123", 12);

  // ── Job Seekers (35) ──────────────────────────────────────────────────────

  const jobSeekers: {
    name: string;
    email: string;
    bio: string;
    headline: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    experiences?: {
      company: string;
      role: string;
      startDate: Date;
      endDate?: Date;
      current: boolean;
      description: string;
      location: string;
    }[];
    projects?: {
      name: string;
      description: string;
      techStack: string[];
      url?: string;
      repoUrl?: string;
      startDate?: Date;
      endDate?: Date;
    }[];
    internships?: {
      company: string;
      role: string;
      startDate: Date;
      endDate?: Date;
      current: boolean;
      description: string;
      location: string;
      stipend?: string;
    }[];
    academics: {
      institution: string;
      degree: string;
      field: string;
      startYear: number;
      endYear?: number;
      gpa?: number;
      current: boolean;
      description?: string;
    }[];
    extraCurriculars?: {
      activity: string;
      role?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
    }[];
    codechef?: {
      username: string;
      rating: number;
      maxRating: number;
      globalRank?: number;
      countryRank?: number;
      solved: number;
      stars: string;
    };
  }[] = [
    // 1 - Senior fullstack, full profile
    {
      name: "Arjun Mehta",
      email: "arjun.mehta@example.com",
      bio: "Full-stack engineer with 7+ years of experience building scalable web applications. Passionate about clean architecture and developer experience.",
      headline: "Senior Software Engineer at Flipkart",
      location: "Bengaluru",
      website: "https://arjunmehta.dev",
      linkedin: "https://linkedin.com/in/arjunmehta",
      github: "https://github.com/arjunmehta",
      experiences: [
        {
          company: "Flipkart",
          role: "Senior Software Engineer",
          startDate: new Date("2021-06-01"),
          current: true,
          description:
            "Leading the checkout experience team. Redesigned the payment flow reducing cart abandonment by 18%. Mentoring a team of 5 engineers.",
          location: "Bengaluru",
        },
        {
          company: "Razorpay",
          role: "Software Engineer",
          startDate: new Date("2018-07-01"),
          endDate: new Date("2021-05-31"),
          current: false,
          description:
            "Built the merchant dashboard from scratch using React and Node.js. Implemented real-time payment tracking with WebSockets.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "PayTrack",
          description:
            "Open-source payment analytics dashboard for small businesses. Integrates with Razorpay, Stripe, and PayU APIs.",
          techStack: ["React", "Node.js", "PostgreSQL", "Redis", "Docker"],
          url: "#",
          repoUrl: "#",
          startDate: new Date("2022-01-01"),
          endDate: new Date("2022-06-01"),
        },
        {
          name: "DevBlog Engine",
          description:
            "A minimal, SEO-optimized blogging engine built with Next.js and MDX. Supports syntax highlighting and RSS feeds.",
          techStack: ["Next.js", "TypeScript", "MDX", "Tailwind CSS"],
          repoUrl: "#",
          startDate: new Date("2023-03-01"),
        },
      ],
      internships: [
        {
          company: "Microsoft India",
          role: "Software Engineering Intern",
          startDate: new Date("2017-05-01"),
          endDate: new Date("2017-07-31"),
          current: false,
          description:
            "Worked on the Azure DevOps pipeline optimization. Reduced build times by 25% through caching strategies.",
          location: "Hyderabad",
          stipend: "80000",
        },
      ],
      academics: [
        {
          institution: "IIT Delhi",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2014,
          endYear: 2018,
          gpa: 8.7,
          current: false,
          description:
            "Thesis on distributed caching systems. Dean's List 2016-17.",
        },
      ],
      extraCurriculars: [
        {
          activity: "ACM ICPC Regional Finalist",
          role: "Team Lead",
          description:
            "Led a 3-member team to ICPC Asia Amritapuri Regionals. Solved 7/12 problems.",
          startDate: new Date("2016-10-01"),
          endDate: new Date("2016-12-01"),
        },
        {
          activity: "Open Source Contributor - React",
          description:
            "Contributed bug fixes and documentation improvements to the React repository.",
          startDate: new Date("2019-01-01"),
        },
      ],
      codechef: {
        username: "arjun_mehta",
        rating: 2050,
        maxRating: 2100,
        globalRank: 1250,
        countryRank: 380,
        solved: 420,
        stars: "5*",
      },
    },
    // 2 - Mid-level backend developer
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      bio: "Backend engineer specializing in distributed systems and microservices. Love writing Go and building high-throughput APIs.",
      headline: "Software Engineer at Zerodha",
      location: "Bengaluru",
      github: "https://github.com/priyasharma",
      linkedin: "https://linkedin.com/in/priyasharma",
      experiences: [
        {
          company: "Zerodha",
          role: "Software Engineer",
          startDate: new Date("2022-01-01"),
          current: true,
          description:
            "Building the core trading engine in Go. Handling 10M+ orders/day with sub-millisecond latency. Working on the Kite Connect API.",
          location: "Bengaluru",
        },
        {
          company: "Swiggy",
          role: "Backend Developer",
          startDate: new Date("2020-06-01"),
          endDate: new Date("2021-12-31"),
          current: false,
          description:
            "Developed the real-time order tracking microservice using Kafka and Redis. Reduced delivery ETA prediction error by 12%.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "GoQueue",
          description:
            "A lightweight, persistent message queue written in Go with support for pub/sub and request-reply patterns.",
          techStack: ["Go", "BoltDB", "gRPC", "Protocol Buffers"],
          repoUrl: "#",
          startDate: new Date("2023-06-01"),
        },
      ],
      academics: [
        {
          institution: "BITS Pilani",
          degree: "B.E.",
          field: "Computer Science",
          startYear: 2016,
          endYear: 2020,
          gpa: 8.2,
          current: false,
        },
      ],
      codechef: {
        username: "priya_codes",
        rating: 1890,
        maxRating: 1950,
        solved: 310,
        stars: "4*",
      },
    },
    // 3 - Junior frontend developer, sparse profile
    {
      name: "Rohan Gupta",
      email: "rohan.gupta@example.com",
      bio: "Frontend developer passionate about creating beautiful, accessible web experiences.",
      headline: "Junior Frontend Developer",
      location: "Delhi",
      github: "https://github.com/rohangupta",
      projects: [
        {
          name: "Portfolio Website",
          description:
            "Personal portfolio built with Next.js and Framer Motion. Features dark mode, blog section, and contact form.",
          techStack: ["Next.js", "Tailwind CSS", "Framer Motion"],
          url: "#",
          repoUrl: "#",
        },
        {
          name: "Weather Dashboard",
          description:
            "A responsive weather app using OpenWeatherMap API with location-based forecasts and historical data charts.",
          techStack: ["React", "Chart.js", "OpenWeatherMap API"],
          url: "#",
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "Delhi Technological University",
          degree: "B.Tech",
          field: "Information Technology",
          startYear: 2020,
          endYear: 2024,
          gpa: 8.0,
          current: false,
        },
      ],
    },
    // 4 - Senior Java backend
    {
      name: "Kavitha Rangan",
      email: "kavitha.rangan@example.com",
      bio: "Java architect with 8 years of enterprise experience. Spring Boot enthusiast and certified AWS Solutions Architect.",
      headline: "Principal Engineer at TCS",
      location: "Chennai",
      linkedin: "https://linkedin.com/in/kavitharangan",
      experiences: [
        {
          company: "TCS",
          role: "Principal Engineer",
          startDate: new Date("2020-04-01"),
          current: true,
          description:
            "Architecting microservices platform serving 50M+ users for a major banking client. Leading a team of 12 engineers across Chennai and Hyderabad.",
          location: "Chennai",
        },
        {
          company: "Infosys",
          role: "Senior Software Engineer",
          startDate: new Date("2017-01-01"),
          endDate: new Date("2020-03-31"),
          current: false,
          description:
            "Built core banking APIs using Spring Boot and Oracle. Migrated legacy SOAP services to REST, improving response times by 40%.",
          location: "Mysore",
        },
        {
          company: "Wipro",
          role: "Software Engineer",
          startDate: new Date("2015-07-01"),
          endDate: new Date("2016-12-31"),
          current: false,
          description:
            "Developed ETL pipelines and reporting modules for healthcare clients using Java and Apache Spark.",
          location: "Bengaluru",
        },
      ],
      academics: [
        {
          institution: "NIT Trichy",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2011,
          endYear: 2015,
          gpa: 8.9,
          current: false,
        },
      ],
    },
    // 5 - Mid-level Python/ML engineer
    {
      name: "Aditya Nair",
      email: "aditya.nair@example.com",
      bio: "ML engineer building production-grade AI systems. Interested in NLP and recommendation systems. Active Kaggle competitor.",
      headline: "ML Engineer at PhonePe",
      location: "Bengaluru",
      github: "https://github.com/adityanair",
      linkedin: "https://linkedin.com/in/adityanair",
      experiences: [
        {
          company: "PhonePe",
          role: "ML Engineer",
          startDate: new Date("2022-03-01"),
          current: true,
          description:
            "Building fraud detection models using XGBoost and deep learning. Reduced false positives by 30% while maintaining 99.2% recall.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "RecSys Engine",
          description:
            "A collaborative filtering recommendation engine using matrix factorization and neural collaborative filtering.",
          techStack: [
            "Python",
            "PyTorch",
            "FastAPI",
            "Redis",
            "PostgreSQL",
          ],
          repoUrl: "#",
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-05-01"),
        },
        {
          name: "LangChain QA Bot",
          description:
            "RAG-based question answering system using LangChain, ChromaDB, and GPT-4 for internal documentation.",
          techStack: ["Python", "LangChain", "ChromaDB", "OpenAI API", "Streamlit"],
          url: "#",
          repoUrl: "#",
          startDate: new Date("2023-08-01"),
        },
      ],
      internships: [
        {
          company: "Amazon India",
          role: "Applied Scientist Intern",
          startDate: new Date("2021-05-01"),
          endDate: new Date("2021-07-31"),
          current: false,
          description:
            "Worked on personalized product ranking using learning-to-rank models. Improved CTR by 5% in A/B tests.",
          location: "Bengaluru",
          stipend: "100000",
        },
      ],
      academics: [
        {
          institution: "IIT Bombay",
          degree: "M.Tech",
          field: "Computer Science (Specialization: Machine Learning)",
          startYear: 2019,
          endYear: 2022,
          gpa: 9.1,
          current: false,
        },
        {
          institution: "College of Engineering, Pune",
          degree: "B.Tech",
          field: "Computer Engineering",
          startYear: 2015,
          endYear: 2019,
          gpa: 8.5,
          current: false,
        },
      ],
      codechef: {
        username: "aditya_ml",
        rating: 1650,
        maxRating: 1720,
        solved: 180,
        stars: "3*",
      },
    },
    // 6 - Senior DevOps
    {
      name: "Sneha Patil",
      email: "sneha.patil@example.com",
      bio: "DevOps engineer obsessed with CI/CD, infrastructure as code, and Kubernetes. Helping teams ship faster.",
      headline: "Senior DevOps Engineer at CRED",
      location: "Bengaluru",
      github: "https://github.com/snehapatil",
      experiences: [
        {
          company: "CRED",
          role: "Senior DevOps Engineer",
          startDate: new Date("2021-09-01"),
          current: true,
          description:
            "Managing 200+ microservices on Kubernetes. Built the CI/CD platform using ArgoCD and GitHub Actions. Reduced deployment time from 30 mins to 5 mins.",
          location: "Bengaluru",
        },
        {
          company: "Freshworks",
          role: "DevOps Engineer",
          startDate: new Date("2019-06-01"),
          endDate: new Date("2021-08-31"),
          current: false,
          description:
            "Set up multi-region AWS infrastructure using Terraform. Implemented monitoring with Prometheus, Grafana, and PagerDuty.",
          location: "Chennai",
        },
      ],
      projects: [
        {
          name: "K8s Helm Charts Collection",
          description:
            "Curated collection of production-ready Helm charts for common infrastructure components.",
          techStack: ["Kubernetes", "Helm", "Terraform", "Go"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "PES University",
          degree: "B.Tech",
          field: "Computer Science",
          startYear: 2015,
          endYear: 2019,
          gpa: 7.8,
          current: false,
        },
      ],
    },
    // 7 - Junior, fresh grad with internships
    {
      name: "Vikram Singh",
      email: "vikram.singh@example.com",
      bio: "Recent CS graduate looking for full-time opportunities in backend development. Excited about building scalable systems.",
      headline: "Fresh Graduate - Backend Developer",
      location: "Pune",
      github: "https://github.com/vikramsingh",
      internships: [
        {
          company: "Zomato",
          role: "Backend Engineering Intern",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-06-30"),
          current: false,
          description:
            "Built restaurant search autocomplete using Elasticsearch. Implemented caching layer that improved response times by 60%.",
          location: "Gurugram",
          stipend: "50000",
        },
        {
          company: "Postman",
          role: "Software Engineering Intern",
          startDate: new Date("2023-05-01"),
          endDate: new Date("2023-07-31"),
          current: false,
          description:
            "Worked on the API testing framework. Added support for GraphQL schema validation.",
          location: "Bengaluru",
          stipend: "40000",
        },
      ],
      projects: [
        {
          name: "URL Shortener",
          description:
            "High-performance URL shortener handling 10K requests/second. Features analytics dashboard and custom aliases.",
          techStack: ["Go", "Redis", "PostgreSQL", "React"],
          url: "#",
          repoUrl: "#",
        },
        {
          name: "Chat Application",
          description:
            "Real-time chat app with rooms, file sharing, and message search. Built during college hackathon.",
          techStack: ["Node.js", "Socket.io", "MongoDB", "React"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "COEP Technological University",
          degree: "B.Tech",
          field: "Computer Engineering",
          startYear: 2020,
          endYear: 2024,
          gpa: 8.3,
          current: false,
          description: "Secretary of the Coding Club. Organized 3 hackathons.",
        },
      ],
      extraCurriculars: [
        {
          activity: "Smart India Hackathon 2023",
          role: "Team Lead",
          description:
            "Won first prize in SIH 2023 for building a crop disease detection system using computer vision.",
          startDate: new Date("2023-08-01"),
          endDate: new Date("2023-12-01"),
        },
      ],
      codechef: {
        username: "vikram_s",
        rating: 1450,
        maxRating: 1520,
        solved: 150,
        stars: "2*",
      },
    },
    // 8 - Mid-level React/Next.js
    {
      name: "Ananya Krishnan",
      email: "ananya.krishnan@example.com",
      bio: "Frontend architect who loves building design systems and performant React applications. TypeScript maximalist.",
      headline: "Frontend Lead at Razorpay",
      location: "Bengaluru",
      website: "https://ananyak.dev",
      github: "https://github.com/ananyakrishnan",
      linkedin: "https://linkedin.com/in/ananyakrishnan",
      experiences: [
        {
          company: "Razorpay",
          role: "Frontend Lead",
          startDate: new Date("2022-04-01"),
          current: true,
          description:
            "Leading the design system team. Built Blade (Razorpay's component library) used across 15+ products. Migrated the merchant dashboard to Next.js 14.",
          location: "Bengaluru",
        },
        {
          company: "Atlassian",
          role: "Software Engineer",
          startDate: new Date("2019-08-01"),
          endDate: new Date("2022-03-31"),
          current: false,
          description:
            "Worked on Jira's board view. Built the drag-and-drop sprint planning interface used by 50M+ users.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "React Form Wizard",
          description:
            "A headless, type-safe multi-step form library for React with built-in validation and state persistence.",
          techStack: ["React", "TypeScript", "Zod", "Zustand"],
          repoUrl: "#",
          url: "#",
        },
      ],
      academics: [
        {
          institution: "IIIT Hyderabad",
          degree: "B.Tech",
          field: "Computer Science",
          startYear: 2015,
          endYear: 2019,
          gpa: 8.6,
          current: false,
        },
      ],
    },
    // 9 - Rust/Systems programmer
    {
      name: "Deepak Joshi",
      email: "deepak.joshi@example.com",
      bio: "Systems programmer working on low-latency infrastructure. Rust evangelist. Previously contributed to the Linux kernel.",
      headline: "Staff Engineer at Zerodha",
      location: "Bengaluru",
      github: "https://github.com/deepakjoshi",
      experiences: [
        {
          company: "Zerodha",
          role: "Staff Engineer",
          startDate: new Date("2020-01-01"),
          current: true,
          description:
            "Building the next-generation order matching engine in Rust. Achieved 99.99th percentile latency under 100 microseconds.",
          location: "Bengaluru",
        },
        {
          company: "Samsung R&D",
          role: "Senior Software Engineer",
          startDate: new Date("2016-07-01"),
          endDate: new Date("2019-12-31"),
          current: false,
          description:
            "Worked on the Tizen OS kernel. Optimized memory management subsystem reducing OOM kills by 35%.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "TinyDB",
          description:
            "A toy relational database written in Rust from scratch. Supports basic SQL, B-tree indexing, and WAL-based recovery.",
          techStack: ["Rust", "LMDB"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "IIT Kanpur",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2012,
          endYear: 2016,
          gpa: 9.2,
          current: false,
        },
      ],
      extraCurriculars: [
        {
          activity: "Linux Kernel Contributor",
          description:
            "Contributed patches to the memory management and scheduling subsystems of the Linux kernel.",
          startDate: new Date("2018-01-01"),
        },
      ],
    },
    // 10 - Junior data engineer
    {
      name: "Meera Iyer",
      email: "meera.iyer@example.com",
      bio: "Data engineer passionate about building reliable data pipelines. Learning Spark and Flink.",
      headline: "Data Engineer at Swiggy",
      location: "Bengaluru",
      experiences: [
        {
          company: "Swiggy",
          role: "Data Engineer",
          startDate: new Date("2023-07-01"),
          current: true,
          description:
            "Building real-time data pipelines using Apache Kafka and Apache Flink. Processing 500M+ events daily for the analytics platform.",
          location: "Bengaluru",
        },
      ],
      internships: [
        {
          company: "Flipkart",
          role: "Data Engineering Intern",
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-06-30"),
          current: false,
          description:
            "Built ETL pipelines using Apache Airflow for the product catalog team.",
          location: "Bengaluru",
          stipend: "60000",
        },
      ],
      academics: [
        {
          institution: "NIT Karnataka",
          degree: "B.Tech",
          field: "Information Technology",
          startYear: 2019,
          endYear: 2023,
          gpa: 8.1,
          current: false,
        },
      ],
    },
    // 11 - Mid-level mobile developer
    {
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      bio: "Mobile developer building cross-platform apps with React Native and Flutter. Shipped apps with 1M+ downloads.",
      headline: "Senior Mobile Developer at CRED",
      location: "Bengaluru",
      linkedin: "https://linkedin.com/in/rahulverma",
      experiences: [
        {
          company: "CRED",
          role: "Senior Mobile Developer",
          startDate: new Date("2022-06-01"),
          current: true,
          description:
            "Leading the React Native team for CRED's rewards module. Implemented the new rewards animation system that increased engagement by 25%.",
          location: "Bengaluru",
        },
        {
          company: "Paytm",
          role: "Mobile Developer",
          startDate: new Date("2020-01-01"),
          endDate: new Date("2022-05-31"),
          current: false,
          description:
            "Built the mini-apps framework enabling third-party apps within the Paytm ecosystem.",
          location: "Noida",
        },
      ],
      projects: [
        {
          name: "RN Performance Monitor",
          description:
            "A React Native library for monitoring app performance metrics (FPS, memory, JS thread) in development.",
          techStack: [
            "React Native",
            "TypeScript",
            "Objective-C",
            "Kotlin",
          ],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "VIT Vellore",
          degree: "B.Tech",
          field: "Computer Science",
          startYear: 2016,
          endYear: 2020,
          gpa: 8.4,
          current: false,
        },
      ],
    },
    // 12 - Junior Python developer, minimal profile
    {
      name: "Sanya Kapoor",
      email: "sanya.kapoor@example.com",
      bio: "Python developer interested in web development and automation.",
      headline: "Software Developer",
      location: "Mumbai",
      projects: [
        {
          name: "Expense Tracker",
          description:
            "A Django-based expense tracking application with budget alerts and monthly reports.",
          techStack: ["Python", "Django", "PostgreSQL", "Bootstrap"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "Mumbai University",
          degree: "B.Sc",
          field: "Computer Science",
          startYear: 2020,
          endYear: 2023,
          gpa: 7.5,
          current: false,
        },
      ],
    },
    // 13 - Senior cloud architect
    {
      name: "Karthik Sundaram",
      email: "karthik.sundaram@example.com",
      bio: "Cloud architect with expertise in AWS and GCP. Helping organizations migrate to cloud-native architectures. 3x AWS certified.",
      headline: "Cloud Architect at Infosys",
      location: "Hyderabad",
      linkedin: "https://linkedin.com/in/karthiksundaram",
      experiences: [
        {
          company: "Infosys",
          role: "Cloud Architect",
          startDate: new Date("2021-01-01"),
          current: true,
          description:
            "Leading cloud migration for a Fortune 500 banking client. Designed multi-region, active-active architecture on AWS reducing RTO from 4 hours to 15 minutes.",
          location: "Hyderabad",
        },
        {
          company: "Wipro",
          role: "Senior Cloud Engineer",
          startDate: new Date("2018-03-01"),
          endDate: new Date("2020-12-31"),
          current: false,
          description:
            "Designed and implemented serverless architectures for e-commerce clients. Reduced infrastructure costs by 40%.",
          location: "Bengaluru",
        },
        {
          company: "HCL Technologies",
          role: "Software Engineer",
          startDate: new Date("2015-06-01"),
          endDate: new Date("2018-02-28"),
          current: false,
          description:
            "Developed and maintained Java-based enterprise applications for telecom clients.",
          location: "Chennai",
        },
      ],
      academics: [
        {
          institution: "NIT Warangal",
          degree: "B.Tech",
          field: "Electronics and Communication",
          startYear: 2011,
          endYear: 2015,
          gpa: 8.0,
          current: false,
        },
      ],
    },
    // 14 - Junior, BCA background
    {
      name: "Pooja Reddy",
      email: "pooja.reddy@example.com",
      bio: "Self-taught web developer transitioning from BCA. Building projects to strengthen my portfolio.",
      headline: "Web Developer",
      location: "Hyderabad",
      github: "https://github.com/poojareddy",
      projects: [
        {
          name: "E-Commerce Store",
          description:
            "Full-stack e-commerce platform with cart, checkout, and payment integration using Razorpay.",
          techStack: ["React", "Express.js", "MongoDB", "Razorpay API"],
          url: "#",
          repoUrl: "#",
        },
        {
          name: "Task Manager API",
          description:
            "RESTful API for task management with JWT authentication, role-based access, and email notifications.",
          techStack: ["Node.js", "Express.js", "MongoDB", "JWT"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "Osmania University",
          degree: "BCA",
          field: "Computer Applications",
          startYear: 2020,
          endYear: 2023,
          gpa: 7.2,
          current: false,
        },
      ],
    },
    // 15 - Mid-level, Android developer
    {
      name: "Nikhil Agarwal",
      email: "nikhil.agarwal@example.com",
      bio: "Android developer with 4 years of experience. Kotlin enthusiast building apps that people love to use.",
      headline: "Android Developer at PhonePe",
      location: "Bengaluru",
      github: "https://github.com/nikhilagarwal",
      experiences: [
        {
          company: "PhonePe",
          role: "Android Developer",
          startDate: new Date("2022-08-01"),
          current: true,
          description:
            "Working on the core payments module. Implemented biometric authentication and optimized app startup time by 40%.",
          location: "Bengaluru",
        },
        {
          company: "Ola",
          role: "Junior Android Developer",
          startDate: new Date("2020-07-01"),
          endDate: new Date("2022-07-31"),
          current: false,
          description:
            "Built the ride scheduling feature and driver rating system. Improved the map rendering performance.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "Compose UI Kit",
          description:
            "A collection of beautiful, reusable Jetpack Compose components following Material Design 3 guidelines.",
          techStack: ["Kotlin", "Jetpack Compose", "Material Design 3"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "BMS College of Engineering",
          degree: "B.E.",
          field: "Computer Science",
          startYear: 2016,
          endYear: 2020,
          gpa: 7.9,
          current: false,
        },
      ],
    },
    // 16 - Junior, MCA student
    {
      name: "Tanvi Deshmukh",
      email: "tanvi.deshmukh@example.com",
      bio: "MCA student passionate about full-stack development. Learning React and Spring Boot.",
      headline: "MCA Student | Aspiring Full-Stack Developer",
      location: "Pune",
      github: "https://github.com/tanvideshmukh",
      projects: [
        {
          name: "Library Management System",
          description:
            "Web-based library management system with book search, issue/return tracking, and fine calculation.",
          techStack: ["Java", "Spring Boot", "MySQL", "Thymeleaf"],
          repoUrl: "#",
        },
      ],
      internships: [
        {
          company: "Persistent Systems",
          role: "Web Development Intern",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-08-31"),
          current: false,
          description:
            "Built internal dashboards using React and Express. Learned agile practices and code review workflows.",
          location: "Pune",
          stipend: "25000",
        },
      ],
      academics: [
        {
          institution: "Pune University",
          degree: "MCA",
          field: "Computer Applications",
          startYear: 2023,
          endYear: 2025,
          current: true,
        },
        {
          institution: "Fergusson College, Pune",
          degree: "B.Sc",
          field: "Computer Science",
          startYear: 2020,
          endYear: 2023,
          gpa: 7.8,
          current: false,
        },
      ],
      extraCurriculars: [
        {
          activity: "Google Developer Student Club",
          role: "Web Development Lead",
          description:
            "Organized workshops on React, Node.js, and Firebase for 200+ students.",
          startDate: new Date("2023-08-01"),
          endDate: new Date("2024-05-01"),
        },
      ],
    },
    // 17 - Senior, security engineer
    {
      name: "Amit Bhatt",
      email: "amit.bhatt@example.com",
      bio: "Security engineer protecting systems at scale. Bug bounty hunter with 50+ valid reports on HackerOne.",
      headline: "Security Engineer at Flipkart",
      location: "Bengaluru",
      website: "https://amitbhatt.security",
      experiences: [
        {
          company: "Flipkart",
          role: "Security Engineer",
          startDate: new Date("2021-03-01"),
          current: true,
          description:
            "Leading application security for the payments platform. Built automated SAST/DAST pipelines. Prevented 3 critical vulnerabilities pre-production.",
          location: "Bengaluru",
        },
        {
          company: "Cisco",
          role: "Software Engineer - Security",
          startDate: new Date("2017-06-01"),
          endDate: new Date("2021-02-28"),
          current: false,
          description:
            "Developed network intrusion detection systems. Built ML-based anomaly detection for enterprise firewalls.",
          location: "Bengaluru",
        },
      ],
      academics: [
        {
          institution: "IIT Roorkee",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2013,
          endYear: 2017,
          gpa: 8.4,
          current: false,
        },
      ],
    },
    // 18 - Mid-level fullstack
    {
      name: "Riya Patel",
      email: "riya.patel@example.com",
      bio: "Full-stack developer who loves building SaaS products. Currently exploring the intersection of AI and web development.",
      headline: "Software Engineer at Freshworks",
      location: "Chennai",
      github: "https://github.com/riyapatel",
      linkedin: "https://linkedin.com/in/riyapatel",
      experiences: [
        {
          company: "Freshworks",
          role: "Software Engineer",
          startDate: new Date("2022-01-01"),
          current: true,
          description:
            "Building the Freshdesk ticketing system. Implemented the AI-powered ticket classification feature using OpenAI APIs.",
          location: "Chennai",
        },
      ],
      internships: [
        {
          company: "Zoho",
          role: "Software Development Intern",
          startDate: new Date("2021-05-01"),
          endDate: new Date("2021-07-31"),
          current: false,
          description:
            "Worked on Zoho CRM's workflow automation module. Built custom action triggers using Java.",
          location: "Chennai",
          stipend: "35000",
        },
      ],
      projects: [
        {
          name: "AI Resume Builder",
          description:
            "SaaS app that generates tailored resumes using AI. Features template library, ATS scoring, and PDF export.",
          techStack: [
            "Next.js",
            "TypeScript",
            "OpenAI API",
            "Prisma",
            "PostgreSQL",
          ],
          url: "#",
          repoUrl: "#",
        },
        {
          name: "Habit Tracker",
          description:
            "Mobile-first habit tracking app with streaks, reminders, and weekly analytics.",
          techStack: ["React", "Firebase", "Chart.js", "PWA"],
          url: "#",
        },
      ],
      academics: [
        {
          institution: "Anna University",
          degree: "B.E.",
          field: "Computer Science and Engineering",
          startYear: 2018,
          endYear: 2022,
          gpa: 8.7,
          current: false,
        },
      ],
      codechef: {
        username: "riya_patel",
        rating: 1580,
        maxRating: 1620,
        solved: 200,
        stars: "3*",
      },
    },
    // 19 - Junior, very sparse profile
    {
      name: "Harsh Trivedi",
      email: "harsh.trivedi@example.com",
      bio: "Learning to code. Interested in web development.",
      headline: "Student",
      location: "Ahmedabad",
      academics: [
        {
          institution: "Gujarat Technological University",
          degree: "B.Tech",
          field: "Computer Engineering",
          startYear: 2022,
          endYear: 2026,
          current: true,
        },
      ],
    },
    // 20 - Mid-level backend, Django
    {
      name: "Shreya Mukherjee",
      email: "shreya.mukherjee@example.com",
      bio: "Python/Django developer building fintech products. Love clean APIs and comprehensive test suites.",
      headline: "Backend Developer at Razorpay",
      location: "Bengaluru",
      github: "https://github.com/shreyam",
      experiences: [
        {
          company: "Razorpay",
          role: "Backend Developer",
          startDate: new Date("2021-08-01"),
          current: true,
          description:
            "Building the subscription billing platform. Handling 2M+ recurring payments monthly. Designed the retry logic for failed payments.",
          location: "Bengaluru",
        },
        {
          company: "Instamojo",
          role: "Python Developer",
          startDate: new Date("2019-06-01"),
          endDate: new Date("2021-07-31"),
          current: false,
          description:
            "Developed payment gateway integrations and merchant onboarding APIs using Django REST Framework.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "Django Billing",
          description:
            "An open-source Django app for subscription billing with support for multiple payment gateways.",
          techStack: ["Python", "Django", "Celery", "PostgreSQL", "Redis"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "Jadavpur University",
          degree: "B.Tech",
          field: "Information Technology",
          startYear: 2015,
          endYear: 2019,
          gpa: 8.3,
          current: false,
        },
      ],
    },
    // 21 - Senior, platform engineer
    {
      name: "Varun Malhotra",
      email: "varun.malhotra@example.com",
      bio: "Platform engineer building internal developer tools. Believe in making developers 10x productive through great tooling.",
      headline: "Staff Platform Engineer at Zomato",
      location: "Gurugram",
      github: "https://github.com/varunmalhotra",
      experiences: [
        {
          company: "Zomato",
          role: "Staff Platform Engineer",
          startDate: new Date("2021-04-01"),
          current: true,
          description:
            "Built the internal developer platform serving 800+ engineers. Designed the service mesh migration from Istio to Linkerd.",
          location: "Gurugram",
        },
        {
          company: "Flipkart",
          role: "Senior Software Engineer",
          startDate: new Date("2018-01-01"),
          endDate: new Date("2021-03-31"),
          current: false,
          description:
            "Built the A/B testing platform handling 200M+ experiments daily. Implemented feature flag system used across all Flipkart services.",
          location: "Bengaluru",
        },
        {
          company: "Oracle",
          role: "Software Engineer",
          startDate: new Date("2015-07-01"),
          endDate: new Date("2017-12-31"),
          current: false,
          description:
            "Worked on Oracle Cloud Infrastructure. Built the monitoring and alerting subsystem.",
          location: "Bengaluru",
        },
      ],
      academics: [
        {
          institution: "IIT Kharagpur",
          degree: "B.Tech + M.Tech (Dual Degree)",
          field: "Computer Science and Engineering",
          startYear: 2010,
          endYear: 2015,
          gpa: 8.8,
          current: false,
        },
      ],
    },
    // 22 - Junior, frontend
    {
      name: "Ishaan Bhat",
      email: "ishaan.bhat@example.com",
      bio: "UI/UX focused frontend developer. I believe great software starts with great design.",
      headline: "Frontend Developer at Swiggy",
      location: "Bengaluru",
      github: "https://github.com/ishaanbhat",
      experiences: [
        {
          company: "Swiggy",
          role: "Frontend Developer",
          startDate: new Date("2024-01-01"),
          current: true,
          description:
            "Working on the restaurant discovery feed. Implemented infinite scroll with virtualization improving scroll performance by 50%.",
          location: "Bengaluru",
        },
      ],
      internships: [
        {
          company: "Cred",
          role: "Frontend Intern",
          startDate: new Date("2023-06-01"),
          endDate: new Date("2023-08-31"),
          current: false,
          description:
            "Built the rewards catalog page with complex animations using Framer Motion.",
          location: "Bengaluru",
          stipend: "45000",
        },
      ],
      projects: [
        {
          name: "Figma to Code",
          description:
            "A tool that converts Figma designs to React/Tailwind code using AI.",
          techStack: ["TypeScript", "React", "Figma API", "OpenAI API"],
          url: "#",
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "RV College of Engineering",
          degree: "B.E.",
          field: "Information Science",
          startYear: 2019,
          endYear: 2023,
          gpa: 8.5,
          current: false,
        },
      ],
    },
    // 23 - Mid-level, Go backend
    {
      name: "Lakshmi Venkatesh",
      email: "lakshmi.venkatesh@example.com",
      bio: "Backend engineer working with Go and Kubernetes. Interested in distributed consensus and database internals.",
      headline: "Software Engineer at Dgraph Labs",
      location: "Bengaluru",
      github: "https://github.com/lakshmivenkatesh",
      experiences: [
        {
          company: "Dgraph Labs",
          role: "Software Engineer",
          startDate: new Date("2022-05-01"),
          current: true,
          description:
            "Contributing to the Dgraph distributed graph database. Working on the Raft consensus implementation and query optimizer.",
          location: "Bengaluru",
        },
        {
          company: "Nutanix",
          role: "Software Engineer",
          startDate: new Date("2020-07-01"),
          endDate: new Date("2022-04-30"),
          current: false,
          description:
            "Built the storage tiering system for Nutanix Objects. Implemented automatic data lifecycle management.",
          location: "Bengaluru",
        },
      ],
      academics: [
        {
          institution: "NIT Surathkal",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2016,
          endYear: 2020,
          gpa: 9.0,
          current: false,
        },
      ],
      codechef: {
        username: "lakshmi_v",
        rating: 1920,
        maxRating: 2000,
        globalRank: 2100,
        countryRank: 650,
        solved: 350,
        stars: "4*",
      },
    },
    // 24 - Junior, sparse, only academic
    {
      name: "Akash Tiwari",
      email: "akash.tiwari@example.com",
      bio: "Final year student exploring software development.",
      headline: "B.Tech Student",
      location: "Lucknow",
      academics: [
        {
          institution: "AKTU",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2021,
          endYear: 2025,
          current: true,
        },
      ],
    },
    // 25 - Mid-level, blockchain
    {
      name: "Siddharth Menon",
      email: "siddharth.menon@example.com",
      bio: "Web3 developer building decentralized applications. Smart contract auditor with experience in Solidity and Rust.",
      headline: "Blockchain Developer at Polygon",
      location: "Mumbai",
      github: "https://github.com/sidmenon",
      website: "https://sidmenon.eth",
      experiences: [
        {
          company: "Polygon",
          role: "Blockchain Developer",
          startDate: new Date("2022-09-01"),
          current: true,
          description:
            "Working on the Polygon zkEVM prover. Optimizing zero-knowledge proof generation for Ethereum L2 scaling.",
          location: "Mumbai",
        },
        {
          company: "CoinDCX",
          role: "Backend Developer",
          startDate: new Date("2020-06-01"),
          endDate: new Date("2022-08-31"),
          current: false,
          description:
            "Built the trading engine for spot and futures markets. Implemented real-time order book management with WebSockets.",
          location: "Mumbai",
        },
      ],
      projects: [
        {
          name: "NFT Marketplace",
          description:
            "Decentralized NFT marketplace on Polygon with lazy minting, auctions, and royalty support.",
          techStack: ["Solidity", "Hardhat", "React", "ethers.js", "IPFS"],
          url: "#",
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "IIT Madras",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2016,
          endYear: 2020,
          gpa: 8.8,
          current: false,
        },
      ],
    },
    // 26 - Senior, tech lead
    {
      name: "Divya Raghavan",
      email: "divya.raghavan@example.com",
      bio: "Engineering manager turned IC. 10+ years building products at scale. Currently focused on developer experience and platform engineering.",
      headline: "Distinguished Engineer at Walmart Labs",
      location: "Bengaluru",
      linkedin: "https://linkedin.com/in/divyaraghavan",
      experiences: [
        {
          company: "Walmart Labs",
          role: "Distinguished Engineer",
          startDate: new Date("2020-06-01"),
          current: true,
          description:
            "Architecting the next-gen e-commerce platform for Walmart India. Leading technical strategy for a 100+ engineer org.",
          location: "Bengaluru",
        },
        {
          company: "Google",
          role: "Senior Software Engineer",
          startDate: new Date("2016-01-01"),
          endDate: new Date("2020-05-31"),
          current: false,
          description:
            "Worked on Google Cloud Spanner. Built the automatic sharding and rebalancing system.",
          location: "Bengaluru",
        },
        {
          company: "Flipkart",
          role: "Software Engineer",
          startDate: new Date("2013-07-01"),
          endDate: new Date("2015-12-31"),
          current: false,
          description:
            "Part of the early engineering team. Built the product catalog service handling 100M+ SKUs.",
          location: "Bengaluru",
        },
      ],
      academics: [
        {
          institution: "IIT Bombay",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2009,
          endYear: 2013,
          gpa: 9.4,
          current: false,
          description: "Institute Gold Medalist. President of the Coding Club.",
        },
      ],
      extraCurriculars: [
        {
          activity: "Conference Speaker",
          description:
            "Regular speaker at JSConf India, GopherCon India, and ReactFoo. Topics include distributed systems and developer productivity.",
          startDate: new Date("2018-01-01"),
        },
        {
          activity: "Tech Blog Author",
          description:
            "Writing about distributed systems and engineering culture. 10K+ followers on Medium.",
          startDate: new Date("2017-01-01"),
        },
      ],
    },
    // 27 - Junior QA/SDET
    {
      name: "Pranav Kulkarni",
      email: "pranav.kulkarni@example.com",
      bio: "SDET passionate about test automation and quality engineering. Building reliable software through comprehensive testing.",
      headline: "SDET at Mindtree",
      location: "Pune",
      experiences: [
        {
          company: "Mindtree",
          role: "SDET",
          startDate: new Date("2023-06-01"),
          current: true,
          description:
            "Writing end-to-end test automation using Playwright and Cypress. Built the CI integration for automated regression testing.",
          location: "Pune",
        },
      ],
      projects: [
        {
          name: "Test Framework",
          description:
            "A modular test automation framework with page object pattern, reporting, and parallel execution support.",
          techStack: ["TypeScript", "Playwright", "Allure Reports"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "Pune Institute of Computer Technology",
          degree: "B.E.",
          field: "Computer Engineering",
          startYear: 2019,
          endYear: 2023,
          gpa: 7.6,
          current: false,
        },
      ],
    },
    // 28 - Mid-level, SRE
    {
      name: "Nandini Rao",
      email: "nandini.rao@example.com",
      bio: "Site Reliability Engineer making distributed systems reliable. Love writing postmortems and building observability tooling.",
      headline: "SRE at Flipkart",
      location: "Bengaluru",
      experiences: [
        {
          company: "Flipkart",
          role: "Site Reliability Engineer",
          startDate: new Date("2021-11-01"),
          current: true,
          description:
            "Maintaining 99.99% uptime for Flipkart's checkout pipeline. Built chaos engineering framework that caught 15 production issues before Big Billion Days.",
          location: "Bengaluru",
        },
        {
          company: "ThoughtWorks",
          role: "Infrastructure Engineer",
          startDate: new Date("2019-07-01"),
          endDate: new Date("2021-10-31"),
          current: false,
          description:
            "Built infrastructure-as-code solutions for enterprise clients using Terraform and Ansible.",
          location: "Pune",
        },
      ],
      academics: [
        {
          institution: "IIIT Bangalore",
          degree: "M.Tech",
          field: "Computer Science",
          startYear: 2017,
          endYear: 2019,
          gpa: 8.6,
          current: false,
        },
        {
          institution: "NIT Calicut",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2013,
          endYear: 2017,
          gpa: 8.1,
          current: false,
        },
      ],
    },
    // 29 - Junior, with codechef focus
    {
      name: "Rajat Sharma",
      email: "rajat.sharma@example.com",
      bio: "Competitive programmer turning into a software developer. Love solving algorithmic problems and optimizing solutions.",
      headline: "Software Developer",
      location: "Jaipur",
      github: "https://github.com/rajatsharma",
      projects: [
        {
          name: "CP Helper",
          description:
            "CLI tool that fetches competitive programming problems, generates test cases, and auto-submits solutions.",
          techStack: ["Python", "Click", "BeautifulSoup"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "MNIT Jaipur",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2020,
          endYear: 2024,
          gpa: 7.9,
          current: false,
        },
      ],
      codechef: {
        username: "rajat_cp",
        rating: 2080,
        maxRating: 2100,
        globalRank: 800,
        countryRank: 250,
        solved: 520,
        stars: "5*",
      },
    },
    // 30 - Senior, data science
    {
      name: "Swati Mishra",
      email: "swati.mishra@example.com",
      bio: "Data scientist with expertise in NLP and computer vision. PhD in deep learning from IISc. Published 8 papers in top ML conferences.",
      headline: "Lead Data Scientist at Flipkart",
      location: "Bengaluru",
      linkedin: "https://linkedin.com/in/swatimishra",
      website: "https://swatimishra.ai",
      experiences: [
        {
          company: "Flipkart",
          role: "Lead Data Scientist",
          startDate: new Date("2021-09-01"),
          current: true,
          description:
            "Leading the visual search team. Built the image-based product search feature that handles 5M+ queries daily.",
          location: "Bengaluru",
        },
        {
          company: "Intel",
          role: "Research Scientist",
          startDate: new Date("2019-01-01"),
          endDate: new Date("2021-08-31"),
          current: false,
          description:
            "Worked on edge AI models for real-time object detection. Published 3 papers on efficient neural architecture search.",
          location: "Bengaluru",
        },
      ],
      academics: [
        {
          institution: "Indian Institute of Science (IISc)",
          degree: "PhD",
          field: "Computer Science (Deep Learning)",
          startYear: 2014,
          endYear: 2019,
          current: false,
          description:
            "Thesis: Efficient Neural Architecture Search for Edge Devices. Published at NeurIPS, ICML, and CVPR.",
        },
        {
          institution: "IIT Guwahati",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2010,
          endYear: 2014,
          gpa: 9.3,
          current: false,
        },
      ],
    },
    // 31 - Junior, M.Tech student
    {
      name: "Aman Dubey",
      email: "aman.dubey@example.com",
      bio: "M.Tech student researching federated learning and privacy-preserving ML. Looking for research internships.",
      headline: "M.Tech Student at IIT Hyderabad",
      location: "Hyderabad",
      github: "https://github.com/amandubey",
      projects: [
        {
          name: "FedLearn",
          description:
            "A federated learning framework for training ML models across distributed devices without sharing raw data.",
          techStack: ["Python", "PyTorch", "gRPC", "Docker"],
          repoUrl: "#",
        },
        {
          name: "Differential Privacy Library",
          description:
            "Python library implementing differentially private versions of common ML algorithms.",
          techStack: ["Python", "NumPy", "scikit-learn"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "IIT Hyderabad",
          degree: "M.Tech",
          field: "Computer Science (AI & ML)",
          startYear: 2024,
          endYear: 2026,
          current: true,
          description:
            "Research focus: Federated Learning and Differential Privacy.",
        },
        {
          institution: "NIT Nagpur",
          degree: "B.Tech",
          field: "Computer Science and Engineering",
          startYear: 2020,
          endYear: 2024,
          gpa: 8.7,
          current: false,
        },
      ],
    },
    // 32 - Mid-level, iOS developer
    {
      name: "Shruti Jain",
      email: "shruti.jain@example.com",
      bio: "iOS developer crafting delightful mobile experiences with Swift and SwiftUI. App Store featured developer.",
      headline: "iOS Developer at Zomato",
      location: "Gurugram",
      experiences: [
        {
          company: "Zomato",
          role: "iOS Developer",
          startDate: new Date("2021-10-01"),
          current: true,
          description:
            "Building the Zomato iOS app. Led the SwiftUI migration. Implemented the restaurant AR preview feature.",
          location: "Gurugram",
        },
        {
          company: "Grab (India)",
          role: "Junior iOS Developer",
          startDate: new Date("2019-08-01"),
          endDate: new Date("2021-09-30"),
          current: false,
          description:
            "Worked on the rider app. Built the real-time driver tracking feature using MapKit.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "SwiftUI Components",
          description:
            "A library of beautiful SwiftUI components for building iOS apps quickly.",
          techStack: ["Swift", "SwiftUI", "Combine"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "NSIT Delhi",
          degree: "B.Tech",
          field: "Computer Engineering",
          startYear: 2015,
          endYear: 2019,
          gpa: 8.2,
          current: false,
        },
      ],
    },
    // 33 - Junior, sparse with internship
    {
      name: "Kunal Saxena",
      email: "kunal.saxena@example.com",
      bio: "Aspiring backend developer. Learning Go and building side projects.",
      headline: "Fresh Graduate",
      location: "Delhi",
      internships: [
        {
          company: "Startup (stealth)",
          role: "Backend Intern",
          startDate: new Date("2024-03-01"),
          endDate: new Date("2024-05-31"),
          current: false,
          description:
            "Built REST APIs using Go and PostgreSQL. Learned about microservices architecture.",
          location: "Remote",
          stipend: "20000",
        },
      ],
      academics: [
        {
          institution: "Amity University",
          degree: "B.Tech",
          field: "Computer Science",
          startYear: 2020,
          endYear: 2024,
          gpa: 7.4,
          current: false,
        },
      ],
    },
    // 34 - Mid-level, full profile with extras
    {
      name: "Aditi Chakraborty",
      email: "aditi.chakraborty@example.com",
      bio: "Product engineer who thinks in systems. Love building features end-to-end from database schema to pixel-perfect UI.",
      headline: "Product Engineer at Notion (India)",
      location: "Mumbai",
      github: "https://github.com/aditichakraborty",
      linkedin: "https://linkedin.com/in/aditichakraborty",
      website: "https://aditic.dev",
      experiences: [
        {
          company: "Notion",
          role: "Product Engineer",
          startDate: new Date("2023-01-01"),
          current: true,
          description:
            "Building the Notion databases feature. Implemented the relational property type and rollup calculations.",
          location: "Mumbai",
        },
        {
          company: "Hasura",
          role: "Software Engineer",
          startDate: new Date("2020-08-01"),
          endDate: new Date("2022-12-31"),
          current: false,
          description:
            "Worked on the Hasura GraphQL engine. Implemented subscriptions and event triggers for real-time data sync.",
          location: "Bengaluru",
        },
      ],
      projects: [
        {
          name: "Open Table Clone",
          description:
            "A restaurant reservation system with real-time availability, table management, and waitlist features.",
          techStack: [
            "Next.js",
            "tRPC",
            "Prisma",
            "PostgreSQL",
            "Tailwind CSS",
          ],
          url: "#",
          repoUrl: "#",
        },
        {
          name: "Markdown Note App",
          description:
            "A minimal note-taking app with markdown support, folder organization, and full-text search.",
          techStack: ["Svelte", "TypeScript", "SQLite", "Electron"],
          repoUrl: "#",
        },
      ],
      internships: [
        {
          company: "Google Summer of Code (Rocket.Chat)",
          role: "Open Source Contributor",
          startDate: new Date("2019-05-01"),
          endDate: new Date("2019-08-31"),
          current: false,
          description:
            "Built the livechat analytics dashboard. Contributed 5K+ lines of code to the Rocket.Chat codebase.",
          location: "Remote",
        },
      ],
      academics: [
        {
          institution: "BITS Pilani, Goa",
          degree: "B.E.",
          field: "Computer Science",
          startYear: 2016,
          endYear: 2020,
          gpa: 8.9,
          current: false,
        },
      ],
      extraCurriculars: [
        {
          activity: "Women Who Code Bengaluru",
          role: "Chapter Lead",
          description:
            "Organized monthly meetups and workshops for 500+ members. Mentored 20+ junior developers.",
          startDate: new Date("2021-01-01"),
          endDate: new Date("2022-12-31"),
        },
      ],
      codechef: {
        username: "aditi_c",
        rating: 1750,
        maxRating: 1820,
        solved: 280,
        stars: "4*",
      },
    },
    // 35 - Junior, only projects
    {
      name: "Dev Prajapati",
      email: "dev.prajapati@example.com",
      bio: "Self-taught developer building projects to learn. Currently exploring Rust and systems programming.",
      headline: "Open Source Enthusiast",
      location: "Surat",
      github: "https://github.com/devprajapati",
      projects: [
        {
          name: "Mini Redis",
          description:
            "A simplified Redis clone in Rust supporting basic commands (GET, SET, DEL, EXPIRE) with persistence.",
          techStack: ["Rust", "Tokio"],
          repoUrl: "#",
        },
        {
          name: "Git Stats CLI",
          description:
            "A CLI tool that generates beautiful contribution statistics from git repositories.",
          techStack: ["Rust", "clap", "crossterm"],
          repoUrl: "#",
        },
        {
          name: "JSON Parser",
          description:
            "A zero-dependency JSON parser written in Rust as a learning exercise. Handles nested objects and arrays.",
          techStack: ["Rust"],
          repoUrl: "#",
        },
      ],
      academics: [
        {
          institution: "Sarvajanik College of Engineering",
          degree: "B.E.",
          field: "Computer Engineering",
          startYear: 2019,
          endYear: 2023,
          gpa: 7.1,
          current: false,
        },
      ],
    },
  ];

  // ── Recruiters (15) ─────────────────────────────────────────────────────────

  const recruiters: {
    name: string;
    email: string;
    jobs?: {
      title: string;
      description: string;
      requirements: string[];
      location?: string;
      remote: boolean;
      salaryMin?: number;
      salaryMax?: number;
    }[];
  }[] = [
    {
      name: "Megha Srinivasan",
      email: "megha.srinivasan@example.com",
      jobs: [
        {
          title: "Senior Frontend Engineer",
          description:
            "We are looking for a Senior Frontend Engineer to join our product team. You will work on building the next generation of our merchant dashboard using React and TypeScript.",
          requirements: [
            "5+ years of frontend development experience",
            "Strong proficiency in React, TypeScript, and modern CSS",
            "Experience with state management (Redux, Zustand, or Jotai)",
            "Familiarity with design systems and component libraries",
            "Good understanding of web performance optimization",
          ],
          location: "Bengaluru",
          remote: false,
          salaryMin: 2500000,
          salaryMax: 4000000,
        },
        {
          title: "Backend Engineer - Payments",
          description:
            "Join our payments team to build the core payment processing infrastructure. You will work on high-throughput, low-latency systems handling millions of transactions.",
          requirements: [
            "3+ years of backend development experience",
            "Strong proficiency in Go or Java",
            "Experience with distributed systems and message queues",
            "Understanding of payment protocols and PCI DSS compliance",
            "Experience with PostgreSQL and Redis",
          ],
          location: "Bengaluru",
          remote: false,
          salaryMin: 2000000,
          salaryMax: 3500000,
        },
      ],
    },
    {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      jobs: [
        {
          title: "Full Stack Developer",
          description:
            "Looking for a Full Stack Developer to join our growing team. You will build features end-to-end for our SaaS platform serving enterprise clients.",
          requirements: [
            "2+ years of full-stack development experience",
            "Proficiency in React and Node.js",
            "Experience with SQL databases",
            "Understanding of RESTful API design",
            "Familiarity with cloud services (AWS/GCP)",
          ],
          location: "Pune",
          remote: true,
          salaryMin: 1200000,
          salaryMax: 2000000,
        },
      ],
    },
    {
      name: "Aparna Nambiar",
      email: "aparna.nambiar@example.com",
      jobs: [
        {
          title: "ML Engineer - NLP",
          description:
            "We are building the next generation of conversational AI. Join us to work on large language models and NLP systems at scale.",
          requirements: [
            "3+ years of ML engineering experience",
            "Strong Python skills with PyTorch or TensorFlow",
            "Experience with NLP tasks (NER, text classification, summarization)",
            "Familiarity with transformer architectures",
            "Experience deploying ML models to production",
          ],
          location: "Bengaluru",
          remote: false,
          salaryMin: 2500000,
          salaryMax: 4500000,
        },
      ],
    },
    {
      name: "Suresh Pillai",
      email: "suresh.pillai@example.com",
      jobs: [
        {
          title: "DevOps Engineer",
          description:
            "We need a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will work with Kubernetes, Terraform, and AWS.",
          requirements: [
            "2+ years of DevOps/SRE experience",
            "Strong Kubernetes and Docker experience",
            "Infrastructure as Code (Terraform preferred)",
            "CI/CD pipeline setup and maintenance",
            "Monitoring and observability tools experience",
          ],
          location: "Hyderabad",
          remote: true,
          salaryMin: 1500000,
          salaryMax: 2800000,
        },
        {
          title: "Junior Software Engineer",
          description:
            "Great opportunity for fresh graduates to join our engineering team. You will work on building features for our enterprise product suite.",
          requirements: [
            "B.Tech/B.E. in Computer Science or related field",
            "Knowledge of any programming language (Java/Python/JavaScript)",
            "Understanding of data structures and algorithms",
            "Willingness to learn and grow",
          ],
          location: "Hyderabad",
          remote: false,
          salaryMin: 600000,
          salaryMax: 1000000,
        },
      ],
    },
    {
      name: "Neha Gupta",
      email: "neha.gupta@example.com",
    },
    {
      name: "Vivek Menon",
      email: "vivek.menon@example.com",
      jobs: [
        {
          title: "Rust Systems Engineer",
          description:
            "Join our core engineering team building high-performance trading systems in Rust. Sub-microsecond latency is our target.",
          requirements: [
            "3+ years of systems programming experience",
            "Strong proficiency in Rust or C++",
            "Understanding of CPU architecture and memory models",
            "Experience with low-latency networking",
            "Knowledge of financial markets is a plus",
          ],
          location: "Bengaluru",
          remote: false,
          salaryMin: 3000000,
          salaryMax: 5000000,
        },
      ],
    },
    {
      name: "Preeti Sharma",
      email: "preeti.sharma@example.com",
      jobs: [
        {
          title: "Android Developer",
          description:
            "We are looking for an Android Developer to build our mobile app from the ground up. You will define the mobile architecture and build the core features.",
          requirements: [
            "3+ years of Android development experience",
            "Strong Kotlin skills with Jetpack Compose experience",
            "Understanding of MVVM architecture and clean code principles",
            "Experience with RESTful APIs and offline-first architecture",
          ],
          location: "Mumbai",
          remote: false,
          salaryMin: 1800000,
          salaryMax: 3000000,
        },
      ],
    },
    {
      name: "Arun Shankar",
      email: "arun.shankar@example.com",
    },
    {
      name: "Priyanka Desai",
      email: "priyanka.desai@example.com",
      jobs: [
        {
          title: "Data Engineer",
          description:
            "Looking for a Data Engineer to build our data platform. You will design and maintain ETL pipelines processing terabytes of data daily.",
          requirements: [
            "2+ years of data engineering experience",
            "Experience with Apache Spark and Kafka",
            "Proficiency in Python and SQL",
            "Familiarity with data warehousing concepts",
            "Experience with Airflow or similar orchestration tools",
          ],
          location: "Bengaluru",
          remote: true,
          salaryMin: 1600000,
          salaryMax: 2800000,
        },
      ],
    },
    {
      name: "Manish Tiwari",
      email: "manish.tiwari@example.com",
      jobs: [
        {
          title: "Site Reliability Engineer",
          description:
            "Join our SRE team to ensure our platform maintains 99.99% uptime. You will build monitoring, alerting, and incident response systems.",
          requirements: [
            "3+ years of SRE or DevOps experience",
            "Strong Linux and networking fundamentals",
            "Experience with Prometheus, Grafana, and ELK stack",
            "Scripting skills in Python or Go",
            "On-call experience and incident management",
          ],
          location: "Bengaluru",
          remote: false,
          salaryMin: 2000000,
          salaryMax: 3500000,
        },
      ],
    },
    {
      name: "Sakshi Agarwal",
      email: "sakshi.agarwal@example.com",
    },
    {
      name: "Rohit Pandey",
      email: "rohit.pandey@example.com",
      jobs: [
        {
          title: "Platform Engineer",
          description:
            "We need a Platform Engineer to build our internal developer platform. You will create tools and abstractions that make our 200+ engineers more productive.",
          requirements: [
            "4+ years of software engineering experience",
            "Experience building internal tools and developer platforms",
            "Strong Kubernetes and service mesh experience",
            "Proficiency in Go or Python",
            "Understanding of CI/CD best practices",
          ],
          location: "Gurugram",
          remote: true,
          salaryMin: 2200000,
          salaryMax: 3800000,
        },
      ],
    },
    {
      name: "Kavya Narayanan",
      email: "kavya.narayanan@example.com",
      jobs: [
        {
          title: "iOS Developer",
          description:
            "Looking for an iOS Developer to join our mobile team. You will build beautiful, performant iOS applications using Swift and SwiftUI.",
          requirements: [
            "2+ years of iOS development experience",
            "Strong Swift skills",
            "Experience with SwiftUI and UIKit",
            "Understanding of iOS app architecture patterns",
            "Published at least one app on the App Store",
          ],
          location: "Chennai",
          remote: false,
          salaryMin: 1500000,
          salaryMax: 2500000,
        },
      ],
    },
    {
      name: "Gaurav Saxena",
      email: "gaurav.saxena@example.com",
    },
    {
      name: "Anjali Singh",
      email: "anjali.singh@example.com",
      jobs: [
        {
          title: "Security Engineer",
          description:
            "Join our security team to protect our platform and customers. You will perform security assessments, build security tooling, and respond to incidents.",
          requirements: [
            "3+ years of security engineering experience",
            "Experience with application security testing (SAST/DAST)",
            "Knowledge of OWASP Top 10 and common vulnerabilities",
            "Scripting skills in Python",
            "Security certifications (CEH, OSCP) are a plus",
          ],
          location: "Delhi",
          remote: true,
          salaryMin: 2000000,
          salaryMax: 3500000,
        },
      ],
    },
  ];

  // ── Create Job Seekers ────────────────────────────────────────────────────

  console.log("Creating job seekers...");
  for (const seeker of jobSeekers) {
    const user = await prisma.user.create({
      data: {
        name: seeker.name,
        email: seeker.email,
        password: hashedPassword,
        role: "JOB_SEEKER",
        emailVerified: new Date(),
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        bio: seeker.bio,
        headline: seeker.headline,
        location: seeker.location,
        website: seeker.website,
        linkedin: seeker.linkedin,
        github: seeker.github,
        visibility: "PUBLIC",
      },
    });

    if (seeker.experiences) {
      for (const exp of seeker.experiences) {
        await prisma.experience.create({
          data: {
            profileId: profile.id,
            company: exp.company,
            role: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.current,
            description: exp.description,
            location: exp.location,
          },
        });
      }
    }

    if (seeker.projects) {
      for (const proj of seeker.projects) {
        await prisma.project.create({
          data: {
            profileId: profile.id,
            name: proj.name,
            description: proj.description,
            techStack: proj.techStack,
            url: proj.url,
            repoUrl: proj.repoUrl,
            startDate: proj.startDate,
            endDate: proj.endDate,
          },
        });
      }
    }

    if (seeker.internships) {
      for (const intern of seeker.internships) {
        await prisma.internship.create({
          data: {
            profileId: profile.id,
            company: intern.company,
            role: intern.role,
            startDate: intern.startDate,
            endDate: intern.endDate,
            current: intern.current,
            description: intern.description,
            location: intern.location,
            stipend: intern.stipend,
          },
        });
      }
    }

    for (const acad of seeker.academics) {
      await prisma.academicBackground.create({
        data: {
          profileId: profile.id,
          institution: acad.institution,
          degree: acad.degree,
          field: acad.field,
          startYear: acad.startYear,
          endYear: acad.endYear,
          gpa: acad.gpa,
          current: acad.current,
          description: acad.description,
        },
      });
    }

    if (seeker.extraCurriculars) {
      for (const ec of seeker.extraCurriculars) {
        await prisma.extraCurricular.create({
          data: {
            profileId: profile.id,
            activity: ec.activity,
            role: ec.role,
            description: ec.description,
            startDate: ec.startDate,
            endDate: ec.endDate,
          },
        });
      }
    }

    if (seeker.codechef) {
      await prisma.codeChefProfile.create({
        data: {
          profileId: profile.id,
          username: seeker.codechef.username,
          rating: seeker.codechef.rating,
          maxRating: seeker.codechef.maxRating,
          globalRank: seeker.codechef.globalRank,
          countryRank: seeker.codechef.countryRank,
          solved: seeker.codechef.solved,
          stars: seeker.codechef.stars,
        },
      });
    }

    console.log(`  Created job seeker: ${seeker.name}`);
  }

  // ── Create Recruiters ─────────────────────────────────────────────────────

  console.log("Creating recruiters...");
  for (const recruiter of recruiters) {
    const user = await prisma.user.create({
      data: {
        name: recruiter.name,
        email: recruiter.email,
        password: hashedPassword,
        role: "RECRUITER",
        emailVerified: new Date(),
      },
    });

    if (recruiter.jobs) {
      for (const job of recruiter.jobs) {
        await prisma.job.create({
          data: {
            recruiterId: user.id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            location: job.location,
            remote: job.remote,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
          },
        });
      }
    }

    console.log(`  Created recruiter: ${recruiter.name}`);
  }

  console.log(`\nSeeding complete! Created ${jobSeekers.length} job seekers and ${recruiters.length} recruiters.`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  });
