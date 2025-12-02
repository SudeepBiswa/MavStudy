import { auth, db, storage } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

window.addEventListener("DOMContentLoaded", () => {
    // Check if user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        
        // User is authenticated, resources page will load
        console.log("User is authenticated, resources page loaded");
    });

    // Resource data structure - supports multiple links per resource (links: [{label, url, note}])
    // Links are sorted alphabetically by label for a neat, organized appearance
    const resources = [
        {
            title: "Study Rooms (by College)",
            category: "Facilities",
            description: "Study rooms are available in many colleges and libraries across campus. Select your college to reserve a room.",
            links: [
                { label: "College of Business Administration - Breakout Rooms", url: "https://www.unomaha.edu/college-of-business-administration/mammel-hall/breakout-rooms.php" },
                { label: "Community Engagement Center - Meeting Rooms", url: "https://www.unomaha.edu/community-engagement-center/reservations-and-parking/cec-meeting-spaces/standard-small-meeting-rooms.php" },
                { label: "Criss Library Study Rooms", url: "https://www.unomaha.edu/criss-library/library-services/borrowing-home/reserve-a-room.php" },
                { label: "Maverick Landing", url: "https://www.unomaha.edu/student-life/maverick-landing.php" }
            ]
        },
        {
            title: "Library Services",
            category: "Academic",
            description: "Access library resources and research databases.",
            links: [
                { label: "Criss Library (home) / Databases", url: "https://www.unomaha.edu/criss-library/index.php" },
                { label: "Library Services", url: "https://www.unomaha.edu/criss-library/library-services/index.php" }
            ]
        },
        {
            title: "Tutoring Centers",
            category: "Academic Support",
            description: "Subject-based tutoring centers and learning centers across campus.",
            links: [
                { label: "Computer Science Learning Center", url: "https://www.unomaha.edu/college-of-information-science-and-technology/computer-science-learning-center/index.php" },
                { label: "Math & Science Learning Center", url: "https://www.unomaha.edu/college-of-arts-and-sciences/math-science-learning-center/index.php" }
            ]
        },
        {
            title: "Writing & Speech",
            category: "Academic Support",
            description: "Help with writing assignments and speech coaching.",
            links: [
                { label: "Speech Center", url: "https://www.unomaha.edu/college-of-communication-fine-arts-and-media/speech-center/index.php" },
                { label: "Writing Center", url: "https://www.unomaha.edu/college-of-arts-and-sciences/writing-center/index.php" }
            ]
        },
        {
            title: "Student Services",
            category: "General",
            description: "Registration, financial aid, counseling and other student support services.",
            links: [
                { label: "Counseling & Psychological Services", url: "https://www.unomaha.edu/counseling-and-psychological-services/" },
                { label: "Financial Aid & Support", url: "https://www.unomaha.edu/admissions/financial-support-and-scholarships/index.php" },
                { label: "Office of the Registrar", url: "https://www.unomaha.edu/registrar/index.php" }
            ]
        },
        {
            title: "Campus Facilities",
            category: "Facilities",
            description: "Campus recreation, dining, and other campus amenities.",
            links: [
                { label: "Campus Recreation & Facilities", url: "https://www.unomaha.edu/student-life/wellness/campus-recreation/index.php" }
            ]
        }
    ];

    // Function to populate resources (can be expanded to fetch from Firebase if needed)
    function populateResources() {
        const container = document.getElementById("resourcesContainer");
        
        // Clear existing content (keep only template)
        container.innerHTML = '';
        
        // Add each resource as a card (supports multiple links)
        resources.forEach((resource, idx) => {
            const card = document.createElement('div');
            card.className = 'resourceCard';

            // Header + description
            const header = document.createElement('div');
            header.className = 'resourceCardHeader';
            header.innerHTML = `<h2>${resource.title}</h2><span class="resourceCategory">${resource.category}</span>`;

            const desc = document.createElement('p');
            desc.className = 'resourceDescription';
            desc.textContent = resource.description;

            card.appendChild(header);
            card.appendChild(desc);

            // Links area
            const linksWrap = document.createElement('div');
            linksWrap.className = 'resourceLinksList';

            const links = resource.links || [];

            // show first two links inline, rest hidden behind toggle
            const visibleCount = 2;

            links.forEach((lnk, i) => {
                const item = document.createElement('div');
                item.className = 'resourceItem';
                item.innerHTML = `<a href="${lnk.url}" target="_blank" rel="noopener noreferrer"><span class="linkLabel">${lnk.label}</span>${lnk.note?` <small class="linkNote"> - ${lnk.note}</small>`:''}<span class="material-icons-round">open_in_new</span></a>`;
                if(i >= visibleCount){
                    item.classList.add('extraLink');
                    item.style.display = 'none';
                }
                linksWrap.appendChild(item);
            });

            card.appendChild(linksWrap);

            // If there are more links than visibleCount, add toggle
            if(links.length > visibleCount){
                const moreBtn = document.createElement('button');
                moreBtn.className = 'moreToggle';
                moreBtn.type = 'button';
                const hiddenCount = links.length - visibleCount;
                moreBtn.textContent = `+ ${hiddenCount} more`;
                moreBtn.setAttribute('aria-expanded', 'false');

                moreBtn.addEventListener('click', () => {
                    const extra = card.querySelectorAll('.extraLink');
                    const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
                    extra.forEach(el => {
                        el.style.display = expanded ? 'none' : 'flex';
                    });
                    moreBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                    moreBtn.textContent = expanded ? `+ ${hiddenCount} more` : `− ${hiddenCount} less`;
                });

                card.appendChild(moreBtn);
            }

            container.appendChild(card);
        });
    }

    // Populate resources on page load
    populateResources();

    // Export function to update resources (useful for admin updates)
    window.updateResourceUrl = function(index, newUrl) {
        if (resources[index]) {
            resources[index].url = newUrl;
            populateResources();
        }
    };
});
