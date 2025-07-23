document.addEventListener('DOMContentLoaded', function () {
    // Hamburger menu
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

        const menuPanel = document.querySelector('.menu-panel');
        if (menuPanel) {
            menuPanel.addEventListener('mouseenter', () => clearTimeout(menuTimeout));
            menuPanel.addEventListener('mouseleave', () => {
                menuTimeout = setTimeout(() => {
                    menuPanel.style.opacity = '0';
                    menuPanel.style.visibility = 'hidden';
                    menuPanel.style.transform = 'translateY(-10px)';
                }, 300);
            });
        }
    }

    // Map
    const tooltip = document.getElementById('country-tooltip');
    const width = 1200;
    const height = 600;

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

    const countryNameFixes = {
        "United States of America": "United States",
        "Czechia": "Czech Republic",
        "North Macedonia": "Macedonia",
        "Republic of the Congo": "Congo",
        "Democratic Republic of the Congo": "Democratic Republic of Congo",
        "Bosnia and Herzegovina": "Bosnia and Herz.",
        "Central African Republic": "Central African Rep.",
        "South Korea": "Korea, South",
        "North Korea": "Korea, North",
        "Myanmar": "Burma",
        "Ivory Coast": "Côte d'Ivoire",
        "Cyprus": "Turkish State of Northern Cyprus",
        "Syria": "Syrian Arab Republic",
        "Russia": "Russian Federation",
        "Laos": "Lao PDR",
        "Cape Verde": "Cabo Verde",
        "Vietnam": "Viet Nam",
        "Brunei": "Brunei Darussalam",
        "Moldova": "Republic of Moldova",
        "Micronesia": "Micronesia (Federated States of)",
        "Vatican": "Holy See",
        
        
    };

    const fixCountryName = name => {
        return countryNameFixes[name] || name;
    };

    const regions = {
        europe: {
            name: "Europe",
            color: "#4f77aa",
            hoverColor: "#3a5a8a",
            countries: [
                "Albania", "Andorra", "Austria", "Belarus", "Belgium", 
                "Bosnia and Herz.", "Bulgaria", "Croatia", "Turkish State of Northern Cyprus",
                "Czech Republic", "Denmark", "Estonia", "Finland", "France", 
                "Germany", "Greece", "Hungary", "Iceland", "Ireland", 
                "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
                "Malta", "Republic of Moldova", "Monaco", "Montenegro", "Netherlands",
                "Macedonia", "Norway", "Poland", "Portugal", "Romania",
                "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain",
                "Sweden", "Switzerland", "Turkey", "Ukraine", "United Kingdom", "Holy See", "Kosovo"
            ]
        },
        asia: {
            name: "Asia",
            color: "#8f4faa",
            hoverColor: "#6a3a8a",
            countries: [
                "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh",
                "Bhutan", "Brunei Darussalam", "Cambodia", "China", "Georgia",
                "India", "Indonesia", "Iran", "Iraq", "Israel",
                "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan",
                "Lao PDR", "Lebanon", "Malaysia", "Maldives", "Mongolia",
                "Burma", "Nepal", "Korea, North", "Oman", "Pakistan",
                "Palestine", "Philippines", "Qatar", "Russian Federation", "Saudi Arabia", 
                "Singapore", "Korea, South", "Sri Lanka", "Syrian Arab Republic", "Tajikistan", 
                "Thailand", "Timor-Leste", "Turkmenistan", "United Arab Emirates", 
                "Uzbekistan", "Viet Nam", "Yemen"
            ]
        },
        americas: {
            name: "Americas",
            color: "#4faa6e",
            hoverColor: "#3a8a5a",
            countries: [
                "Canada", "United States", "Mexico"
            ]
        },
        oceania: {
            name: "Oceania",
            color: "#aa8f4f",
            hoverColor: "#8a6a3a",
            countries: [
                "Australia", "New Zealand"
            ]
        }
    };

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", event => {
            if (event.transform.k === 1) {
                event.transform.x = 0;
                event.transform.y = 0;
            }
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(data => {
        const countries = topojson.feature(data, data.objects.countries).features
            .filter(d => {
                const name = fixCountryName(d.properties.name);
                return (
                    regions.europe.countries.includes(name) ||
                    regions.asia.countries.includes(name) ||
                    regions.americas.countries.includes(name) ||
                    regions.oceania.countries.includes(name)
                );
            });

        const countryColors = {};
        countries.forEach(d => {
            const name = fixCountryName(d.properties.name);
            if (regions.europe.countries.includes(name)) countryColors[name] = regions.europe.color;
            else if (regions.asia.countries.includes(name)) countryColors[name] = regions.asia.color;
            else if (regions.americas.countries.includes(name)) countryColors[name] = regions.americas.color;
            else if (regions.oceania.countries.includes(name)) countryColors[name] = regions.oceania.color;
            else countryColors[name] = "#f0f0f0";
        });

        g.selectAll(".country")
            .data(countries)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", d => countryColors[fixCountryName(d.properties.name)])
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                const name = fixCountryName(d.properties.name);
                let hoverColor;

                if (regions.europe.countries.includes(name)) hoverColor = regions.europe.hoverColor;
                else if (regions.asia.countries.includes(name)) hoverColor = regions.asia.hoverColor;
                else if (regions.americas.countries.includes(name)) hoverColor = regions.americas.hoverColor;
                else if (regions.oceania.countries.includes(name)) hoverColor = regions.oceania.hoverColor;

                d3.select(this)
                    .attr("fill", hoverColor)
                    .attr("stroke-width", 1.5);

                tooltip.textContent = name;
                tooltip.style.opacity = '1';
                // Use clientX/clientY plus scroll offsets for robust positioning
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                tooltip.style.left = `${event.clientX + scrollX}px`;
                tooltip.style.top = `${event.clientY + scrollY - 30}px`;
            })
            .on("mouseout", function (event, d) {
                const name = fixCountryName(d.properties.name);
                d3.select(this)
                    .attr("fill", countryColors[name])
                    .attr("stroke-width", 0.5);

                tooltip.style.opacity = '0';
            })
            .on("mousemove", function (event) {
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                tooltip.style.left = `${event.clientX + scrollX}px`;
                tooltip.style.top = `${event.clientY + scrollY - 30}px`;
            })
            .on("click", function (event, d) {
                const name = fixCountryName(d.properties.name);
                if (regions.europe.countries.includes(name)) {
                    window.location.href = "countries/europe.html";
                } else if (regions.asia.countries.includes(name)) {
                    window.location.href = "countries/asia.html";
                } else if (regions.americas.countries.includes(name)) {
                    window.location.href = "countries/americas.html";
                } else if (regions.oceania.countries.includes(name)) {
                    window.location.href = "countries/oceania.html";
                }
            });
            
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
    }).catch(error => {
        console.error("Error loading map data:", error);
        document.getElementById("world-map").innerHTML =
            "<p class='error-message'>Error loading map data. Please try again later.</p>";
    });

