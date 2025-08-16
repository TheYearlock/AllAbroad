document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamburgerContainer = document.querySelector('.hamburger-container');
    let menuTimeout;
    
    if (hamburgerContainer) {
        hamburgerContainer.addEventListener('mouseenter', () => {
            clearTimeout(menuTimeout);
            const menuPanel = hamburgerContainer.querySelector('.menu-panel');
            menuPanel.style.opacity = '1';
            menuPanel.style.visibility = 'visible';
            menuPanel.style.transform = 'translateY(0)';
        });
        
        hamburgerContainer.addEventListener('mouseleave', () => {
            const menuPanel = hamburgerContainer.querySelector('.menu-panel');
            menuTimeout = setTimeout(() => {
                menuPanel.style.opacity = '0';
                menuPanel.style.visibility = 'hidden';
                menuPanel.style.transform = 'translateY(-10px)';
            }, 300);
        });
        
        // Keep menu open when hovering over panel
        const menuPanel = document.querySelector('.menu-panel');
        if (menuPanel) {
            menuPanel.addEventListener('mouseenter', () => {
                clearTimeout(menuTimeout);
            });
            
            menuPanel.addEventListener('mouseleave', () => {
                menuTimeout = setTimeout(() => {
                    menuPanel.style.opacity = '0';
                    menuPanel.style.visibility = 'hidden';
                    menuPanel.style.transform = 'translateY(-10px)';
                }, 300);
            });
        }
    }

    // Map functionality
    const tooltip = document.getElementById('country-tooltip');
    const width = 1200;
    const height = 700;
    
    // Debug: Check if map container exists
    console.log("Map container:", document.getElementById('world-map'));

    const worldMap = document.getElementById('world-map');
    if (worldMap) {
        const svg = d3.select("#world-map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        const g = svg.append("g");
        
        const projection = d3.geoNaturalEarth1()
            .scale(width / 5)
            .translate([width / 2, height / 2]);
        
        const path = d3.geoPath().projection(projection);
        
        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                // Only allow panning if zoomed in (scale > 1)
                if (event.transform.k === 1) {
                    // Reset any translation if at original scale
                    event.transform.x = 0;
                    event.transform.y = 0;
                }
                g.attr("transform", event.transform);
            });
        
        svg.call(zoom);
        
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
            const countries = topojson.feature(data, data.objects.countries).features
                .filter(d => d.properties.name !== 'Antarctica'); // Explicitly filter out Antarctica
            g.selectAll(".country")
                .data(countries)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", path)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("fill", "#E63946");
                    if (tooltip) {
                        tooltip.textContent = d.properties.name;
                        tooltip.style.opacity = '1';
                        tooltip.style.left = `${event.clientX}px`;
                        tooltip.style.top = `${event.clientY - 30}px`;
                    }
                })
                .on("mouseout", function() {
                    d3.select(this).attr("fill", "#f0f0f0");
                    if (tooltip) tooltip.style.opacity = '0';
                })
                .on("mousemove", function(event) {
                    if (tooltip) {
                        tooltip.style.left = `${event.clientX}px`;
                        tooltip.style.top = `${event.clientY - 30}px`;
                    }
                })
                .on("click", function(event, d) {
                    const countryPages = {
                        "Germany": "allcountries/germany.html",
                        "France": "allcountries/france.html",
                        "United States of America": "allcountries/usa.html",
                        "Turkey": "allcountries/turkey.html",
                        "Japan": "allcountries/japan.html",
                        "United Kingdom": "allcountries/UK.html"
                    };
                    const countryName = d.properties.name;
                    if (countryPages[countryName]) {
                        window.location.href = countryPages[countryName];
                    } else {
                        // Optionally: redirect to a default countries page or do nothing
                        // window.location.href = "Continents.html";
                    }
                });

            d3.select(".zoom-in").on("click", () => {
                svg.transition().duration(300).call(zoom.scaleBy, 1.5);
            });
            
            d3.select(".zoom-out").on("click", () => {
                svg.transition().duration(300).call(zoom.scaleBy, 0.75);
            });
            
            d3.select(".reset").on("click", () => {
                svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
            });
        });
    }
});
//NEWS DATA NEWS DATA ANLADIN MI GARİ
const newsData = [
    {
        title: "Önemli Duyuru",
        description: "Bu websitesi geliştirme aşamasındadır.",
        category: "Update",
        date: "June 10, 2025",
        image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        url: ""
    },
    {
        title: "Erasmus+ Scholarship Guide",
        description: "Complete guide to 2024 Erasmus+ opportunities for Turkish students",
        category: "Scholarships",
        date: "June 15, 2024",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
        url: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students"
    },
    {
        title: "Study in Germany Updates",
        description: "Latest visa requirements and university application deadlines",
        category: "Visa News",
        date: "June 12, 2024",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        url: "https://www.daad.de/en/study-and-research-in-germany/"
    },
    {
        title: "US University Rankings 2024",
        description: "QS World University Rankings just released - see the top schools",
        category: "Rankings",
        date: "June 10, 2024",
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
        url: "https://www.topuniversities.com/university-rankings"
    },
    {
        title: "UK Student Visa Changes",
        description: "New policies affecting international students in the UK",
        category: "Visa News",
        date: "June 8, 2024",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
        url: "https://www.gov.uk/student-visa"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // [Keep all your existing hamburger and map code]
    
    // Initialize News Slider
    initNewsSlider();
});

function initNewsSlider() {
    const slider = document.getElementById('news-slider');
    
    // Generate news cards
    newsData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('data-url', item.url);
        card.innerHTML = `
            <div class="news-image" style="background-image: url('${item.image}')">
                <div class="news-category">${item.category}</div>
            </div>
            <div class="news-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="news-footer">
                    <span class="news-date"><i class="far fa-calendar-alt"></i> ${item.date}</span>
                    <span class="read-more">Read More <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.open(item.url, '_blank');
        });
        
        slider.appendChild(card);
    });

    // Slider navigation
    let currentIndex = 0;
    const cards = document.querySelectorAll('.news-card');
    const cardWidth = cards[0].offsetWidth + 30;
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - 3;
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 3) {
            currentIndex++;
            updateSlider();
        }
    });

    updateSlider();

    // Show URL tooltip in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.querySelector('.beta-tag').textContent = 'Development Mode - Links Visible';
        const style = document.createElement('style');
        style.textContent = `
            .news-card:hover::after {
                content: attr(data-url);
                position: absolute;
                bottom: -25px;
                left: 0;
                font-size: 10px;
                color: #666;
                background: #f8f8f8;
                padding: 2px 5px;
                border-radius: 3px;
                width: 100%;
                box-sizing: border-box;
            }
        `;
        document.head.appendChild(style);
    }
}
