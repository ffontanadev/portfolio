export const MARKDOWN_RESUME = `# Felipe Fontana's CV

- Phone: +598 92 617 302
- Email: [contacto@ffontana.dev](mailto:contacto@ffontana.dev)
- Location: Young, Río Negro, Uruguay
- Website: [ffontana.dev](https://ffontana.dev/)
- LinkedIn: [felipefontana](https://linkedin.com/in/felipefontana)
- GitHub: [ffontanadev](https://github.com/ffontanadev)
- GitHub: [elFonTii](https://github.com/elFonTii)


# Summary

Software Engineer with 2+ years of experience building scalable web and mobile applications. Specialized in full-stack development with the React ecosystem (React, Next.js, React Native) and Java Spring Boot. Proven track record of delivering high-impact solutions including cross-platform banking apps, e-wallet platforms, and enterprise API migrations. Passionate about continuous learning, code quality, and innovative problem-solving.

# Experience

## Magenta Innova, Software Engineer

- Aug 2022 – present
- Uruguay
- BBVA Uruguay API Migration: Executed pre-migration tasks for ~48 APIs, improving test coverage from 20% to 85%+ on newest endpoints using JUnit and Mockito within a team of 10 engineers.
- Resolved linting issues in legacy code and ensured reliable deployments through CI/CD pipelines with Jenkins, OpenShift, and SonarQube.
- MiniPay (E-Wallet Application): Led full-stack development of an internal e-wallet platform, managing database architecture with Supabase, implementing authentication with NextAuth, and building the backend alongside a junior colleague in a team of 4.
- Technologies: Next.js, Supabase, NextAuth, React Query, Figma for UI design.
- E-Banking Mobile App: Contributed to all aspects of a cross-platform mobile banking application for iOS and Android, integrating biometric authentication, push notifications, API consumption, and JWT-based security.
- Worked within the React Native ecosystem delivering user-focused solutions in a team of 4 over 1.5 years.

# Education

## Hack Academy, Full-Stack Web Development

- 2022 – 2022
- Uruguay
- Full-time intensive program with 600+ hours of hands-on training.
- Core technologies: JavaScript (ES6+), Node.js, React, MySQL, and MongoDB.

## UTU - Escuela Técnica Superior, Information Technology (Web Technologies Focus)

- 2019 – 2021
- Young, Uruguay
- Final Project: Led development of a web application for managing rentals at a local sports complex using Express.js, Handlebars, and MySQL. Responsibilities included client meetings, Gantt-based project planning, and leading the development team.
- IoT Project: Built a smart food cooler capable of autonomously tracking its owner using Arduino, high-precision GPS, compass modules, Bluetooth connectivity, and motor controllers.
- Foundational training in Arduino, Raspberry Pi, relational databases, Node.js, JWT, SQL, HTML5, JavaScript, and AJAX.

# Skills

- Frontend: React, Next.js, React Native, Expo, Astro, HTML5, CSS3, Figma
- Backend: Node.js, Express.js, Java Spring Boot, REST APIs
- Databases: MySQL, MongoDB, Supabase, PostgreSQL
- DevOps & Tools: Git, Jenkins, OpenShift, SonarQube, Docker
- Other: Arduino, Unity (C#), JWT Authentication, Agile/Scrum
# Certifications

## Cloud Computing


## Digital Skills for Professionals


# Languages

- Spanish: Native
- English: Intermediate (B1)
`;

export const HTML_RESUME = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Felipe Fontana's CV</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            font-size: 16px;
            line-height: 1.6;
            color: #24292f;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        .container {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }

        @media (max-width: 767px) {
            .container {
                padding: 15px;
            }
        }

        h1 {
            font-size: 2em;
            font-weight: 600;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #d0d7de;
            margin-top: 24px;
            margin-bottom: 16px;
        }

        h1:first-child {
            margin-top: 0;
        }

        h2 {
            font-size: 1.5em;
            font-weight: 600;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #d0d7de;
            margin-top: 24px;
            margin-bottom: 16px;
        }

        ul {
            padding-left: 2em;
            margin-top: 0;
            margin-bottom: 16px;
        }

        li {
            margin-top: 0.25em;
        }

        p {
            margin-top: 0;
            margin-bottom: 16px;
        }

        a {
            color: #0969da;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        @media print {
            body {
                background-color: white;
            }
            
            .container {
                max-width: 100%;
                padding: 20px;
            }

            h1, h2 {
                page-break-after: avoid;
            }

            ul {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Felipe Fontana's CV</h1>
        <ul>
            <li>Phone: +598 92 617 302</li>
            <li>Email: <a href="mailto:contacto@ffontana.dev">contacto@ffontana.dev</a></li>
            <li>Location: Young, Río Negro, Uruguay</li>
            <li>Website: <a href="https://ffontana.dev/">ffontana.dev</a></li>
            <li>LinkedIn: <a href="https://linkedin.com/in/felipefontana">felipefontana</a></li>
            <li>GitHub: <a href="https://github.com/ffontanadev">ffontanadev</a></li>
            <li>GitHub: <a href="https://github.com/elFonTii">elFonTii</a></li>
        </ul>

        <h1>Summary</h1>
        <p>Software Engineer with 2+ years of experience building scalable web and mobile applications. Specialized in full-stack development with the React ecosystem (React, Next.js, React Native) and Java Spring Boot. Proven track record of delivering high-impact solutions including cross-platform banking apps, e-wallet platforms, and enterprise API migrations. Passionate about continuous learning, code quality, and innovative problem-solving.</p>

        <h1>Experience</h1>
        <h2>Magenta Innova, Software Engineer</h2>
        <ul>
            <li>Aug 2022 – present</li>
            <li>Uruguay</li>
            <li>BBVA Uruguay API Migration: Executed pre-migration tasks for ~48 APIs, improving test coverage from 20% to 85%+ on newest endpoints using JUnit and Mockito within a team of 10 engineers.</li>
            <li>Resolved linting issues in legacy code and ensured reliable deployments through CI/CD pipelines with Jenkins, OpenShift, and SonarQube.</li>
            <li>MiniPay (E-Wallet Application): Led full-stack development of an internal e-wallet platform, managing database architecture with Supabase, implementing authentication with NextAuth, and building the backend alongside a junior colleague in a team of 4.</li>
            <li>Technologies: Next.js, Supabase, NextAuth, React Query, Figma for UI design.</li>
            <li>E-Banking Mobile App: Contributed to all aspects of a cross-platform mobile banking application for iOS and Android, integrating biometric authentication, push notifications, API consumption, and JWT-based security.</li>
            <li>Worked within the React Native ecosystem delivering user-focused solutions in a team of 4 over 1.5 years.</li>
        </ul>

        <h1>Education</h1>
        <h2>Hack Academy, Full-Stack Web Development</h2>
        <ul>
            <li>2022 – 2022</li>
            <li>Uruguay</li>
            <li>Full-time intensive program with 600+ hours of hands-on training.</li>
            <li>Core technologies: JavaScript (ES6+), Node.js, React, MySQL, and MongoDB.</li>
        </ul>

        <h2>UTU - Escuela Técnica Superior, Information Technology (Web Technologies Focus)</h2>
        <ul>
            <li>2019 – 2021</li>
            <li>Young, Uruguay</li>
            <li>Final Project: Led development of a web application for managing rentals at a local sports complex using Express.js, Handlebars, and MySQL. Responsibilities included client meetings, Gantt-based project planning, and leading the development team.</li>
            <li>IoT Project: Built a smart food cooler capable of autonomously tracking its owner using Arduino, high-precision GPS, compass modules, Bluetooth connectivity, and motor controllers.</li>
            <li>Foundational training in Arduino, Raspberry Pi, relational databases, Node.js, JWT, SQL, HTML5, JavaScript, and AJAX.</li>
        </ul>

        <h1>Skills</h1>
        <ul>
            <li>Frontend: React, Next.js, React Native, Expo, Astro, HTML5, CSS3, Figma</li>
            <li>Backend: Node.js, Express.js, Java Spring Boot, REST APIs</li>
            <li>Databases: MySQL, MongoDB, Supabase, PostgreSQL</li>
            <li>DevOps &amp; Tools: Git, Jenkins, OpenShift, SonarQube, Docker</li>
            <li>Other: Arduino, Unity (C#), JWT Authentication, Agile/Scrum</li>
        </ul>

        <h1>Certifications</h1>
        <h2>Cloud Computing</h2>
        <h2>Digital Skills for Professionals</h2>

        <h1>Languages</h1>
        <ul>
            <li>Spanish: Native</li>
            <li>English: Intermediate (B1)</li>
        </ul>
    </div>
</body>
</html>`;
