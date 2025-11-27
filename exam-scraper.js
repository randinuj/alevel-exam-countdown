/* ============================================================
   Enhanced A/L Exam Date Scraper for Countdown Timer
   Keeps original Gazette.lk functionality + adds more official sources
   ============================================================ */

class EnhancedExamDateScraper {
    constructor() {
        // Keep the original Gazette URL and add more official sources
        this.SOURCES = [
            {
                name: "Gazette.lk (Official)",
                url: "https://www.gazette.lk/",
                priority: 1,
                type: "gazette"
            },
            {
                name: "Department of Examinations",
                url: "https://www.doenets.lk/examination/al",
                priority: 1,
                type: "official"
            },
            {
                name: "DOE Examinations Category",
                url: "https://www.doenets.lk/category/examinations/advanced-level",
                priority: 2,
                type: "official"
            },
            {
                name: "Ministry of Education",
                url: "https://www.moe.gov.lk/category/examinations/",
                priority: 3,
                type: "official"
            },
            {
                name: "DOE Notices",
                url: "https://www.doenets.lk/notices",
                priority: 2,
                type: "notices"
            }
        ];
        
        this.CACHE_KEY = 'al_exam_dates_enhanced_cache';
        this.CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
        this.MAX_LINKS_TO_CHECK = 20;
        this.KEYWORDS = ["A/L", "Advanced Level", "GCE A/L", "G.C.E. A/L", "time table", "timetable", "exam", "examination"];
    }

    async getExamDates(forceRefresh = false) {
        // Check cache first (unless forcing refresh)
        if (!forceRefresh) {
            const cached = this.getCachedDates();
            if (cached) {
                console.log("Using cached exam dates:", cached);
                return cached;
            }
        }

        console.log("Fetching fresh exam dates from official sources...");
        
        // Try sources in priority order
        const sortedSources = [...this.SOURCES].sort((a, b) => a.priority - b.priority);
        
        for (const source of sortedSources) {
            try {
                console.log(`Trying source: ${source.name} - ${source.url}`);
                const dates = await this.scrapeSource(source);
                
                if (dates && dates.start && dates.end) {
                    console.log(`✅ Successfully found dates from ${source.name}`);
                    this.cacheDates(dates);
                    return dates;
                } else if (dates && (dates.start || dates.end)) {
                    console.log(`⚠️ Partial dates found from ${source.name}`, dates);
                    // Continue to next source to try to get complete dates
                }
            } catch (error) {
                console.warn(`❌ Failed to scrape ${source.name}:`, error.message);
                continue;
            }
        }

        // If no complete dates found, try to combine partial results
        const fallbackDates = await this.getCombinedDates();
        if (fallbackDates.start && fallbackDates.end) {
            this.cacheDates(fallbackDates);
            return fallbackDates;
        }

        // Final fallback
        console.log("Using fallback estimated dates");
        return this.getFallbackDates();
    }

    async scrapeSource(source) {
        if (source.type === "gazette") {
            return await this.scrapeGazetteSource(source);
        } else {
            return await this.scrapeStandardWebsite(source);
        }
    }

    async scrapeGazetteSource(source) {
        // Use the original Gazette crawling logic
        try {
            const postLinks = await this.discoverPostLinks(source.url);
            console.log(`Discovered ${postLinks.length} posts from Gazette`);
            
            for (const postUrl of postLinks.slice(0, 5)) { // Check first 5 posts
                try {
                    const dates = await this.scrapePostForDates(postUrl);
                    if (dates.start && dates.end) {
                        return {
                            ...dates,
                            source: `${source.name} - ${postUrl}`,
                            isEstimated: false
                        };
                    }
                } catch (error) {
                    console.warn(`Failed to scrape Gazette post ${postUrl}:`, error);
                }
            }
        } catch (error) {
            throw new Error(`Gazette scraping failed: ${error.message}`);
        }
        
        return null;
    }

    async scrapeStandardWebsite(source) {
        try {
            const html = await this.fetchWithProxy(source.url);
            const dates = this.extractDatesFromHTML(html, source.url);
            
            if (dates.start && dates.end) {
                return {
                    ...dates,
                    source: source.name,
                    isEstimated: false
                };
            }
            
            return dates;
        } catch (error) {
            throw new Error(`Website scraping failed: ${error.message}`);
        }
    }

    // Keep the original Gazette discovery functions
    async discoverPostLinks(listUrl, maxLinks = this.MAX_LINKS_TO_CHECK) {
        const html = await this.fetchWithProxy(listUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        const anchors = Array.from(doc.querySelectorAll("a[href]"));
        const links = [];
        
        for (let a of anchors) {
            const href = a.getAttribute("href");
            if (!href) continue;
            
            let fullUrl;
            try {
                fullUrl = new URL(href, listUrl).href;
            } catch (e) {
                continue;
            }
            
            // Gazette-specific filtering
            const isSameSite = (new URL(fullUrl)).hostname.endsWith((new URL(listUrl)).hostname);
            const txt = (a.textContent || "").toLowerCase();
            const path = (new URL(fullUrl)).pathname.toLowerCase();
            
            const looksLikePost = this.KEYWORDS.some(k => txt.includes(k.toLowerCase())) ||
                                /gce|a-?l|a\/l|time|timetable|exam|examination/.test(path) ||
                                /\b20(2|3|4|5)\b/.test(path);
            
            if (looksLikePost && isSameSite) {
                if (!links.includes(fullUrl)) links.push(fullUrl);
            }
            
            if (links.length >= maxLinks) break;
        }
        
        return links;
    }

    async scrapePostForDates(postUrl) {
        const html = await this.fetchWithProxy(postUrl);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const bodyText = doc.body ? doc.body.textContent : html;

        // Use the original date extraction logic
        const found = this.extractDatesFromText(bodyText);
        if (found && (found.start || found.end)) {
            return {
                start: found.start ? found.start.getTime() : null,
                end: found.end ? found.end.getTime() : null,
                source: postUrl,
                isEstimated: false
            };
        }

        return { start: null, end: null, source: postUrl };
    }

    extractDatesFromText(text) {
        if (!text) return null;
        const cleaned = text.replace(/\s+/g, " ");
        
        // Enhanced date patterns for Sri Lankan formats
        const dateRegex = /(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:[A-Za-z]{3,9})\s+\d{2,4}|(?:[A-Za-z]{3,9})\s+\d{1,2}(?:,)?\s+\d{2,4}|20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/gi;

        // Look for date ranges
        const rangePattern = new RegExp("(" + dateRegex.source + ")\\s*(?:to|until|\\-|–|—)\\s*(" + dateRegex.source + ")", "gi");
        let rangeMatch;
        while ((rangeMatch = rangePattern.exec(cleaned)) !== null) {
            const d1 = this.parseDate(rangeMatch[1]);
            const d2 = this.parseDate(rangeMatch[2]);
            if (d1 && d2) {
                return { 
                    start: d1 < d2 ? d1 : d2, 
                    end: d1 > d2 ? d1 : d2 
                };
            }
        }

        // Look for start/end keywords
        const startPattern = /(?:commences|starts?|begins?).*?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4})/gi;
        const endPattern = /(?:ends?|concludes?|finishes?).*?(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4})/gi;

        let startDate = null;
        let endDate = null;

        const startMatch = startPattern.exec(cleaned);
        if (startMatch) startDate = this.parseDate(startMatch[1]);

        const endMatch = endPattern.exec(cleaned);
        if (endMatch) endDate = this.parseDate(endMatch[1]);

        if (startDate || endDate) {
            return { start: startDate, end: endDate };
        }

        return null;
    }

    extractDatesFromHTML(html, source) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const text = doc.body.textContent;
        return this.extractDatesFromText(text);
    }

    async getCombinedDates() {
        // Try to combine partial results from multiple sources
        const partialResults = [];
        
        for (const source of this.SOURCES.slice(0, 3)) { // Check first 3 sources
            try {
                const dates = await this.scrapeSource(source);
                if (dates && (dates.start || dates.end)) {
                    partialResults.push(dates);
                }
            } catch (error) {
                continue;
            }
        }

        // Combine start and end from different sources
        let combinedStart = null;
        let combinedEnd = null;
        let combinedSource = "combined_sources";

        for (const result of partialResults) {
            if (result.start && !combinedStart) combinedStart = result.start;
            if (result.end && !combinedEnd) combinedEnd = result.end;
        }

        return {
            start: combinedStart,
            end: combinedEnd,
            source: combinedSource,
            isEstimated: !!(combinedStart && combinedEnd)
        };
    }

    parseDate(dateStr) {
        // Use the robust date parser from original code
        if (!dateStr && dateStr !== 0) return null;
        if (typeof dateStr === "number") return new Date(dateStr);
        
        let s = String(dateStr).trim();
        s = s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
        s = s.replace(/\b(\d{1,2})(?:st|nd|rd|th)\b/gi, "$1");

        const months = {
            january:0, february:1, march:2, april:3, may:4, june:5, july:6, 
            august:7, september:8, october:9, november:10, december:11,
            jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, sept:8, oct:9, nov:10, dec:11
        };

        // Try different date formats
        let m = s.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
        if (m) {
            let d = parseInt(m[1],10), mo = parseInt(m[2],10), y = parseInt(m[3],10);
            if (y < 100) y += 2000;
            const date = new Date(y, mo-1, d, 9, 0, 0);
            if (!isNaN(date)) return date;
        }

        m = s.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})\b/);
        if (m) {
            const d = parseInt(m[1],10), mon = m[2].toLowerCase(), y = parseInt(m[3],10);
            const mo = months[mon];
            if (mo !== undefined) return new Date(y, mo, d, 9, 0, 0);
        }

        const dt = new Date(s);
        return !isNaN(dt) ? dt : null;
    }

    async fetchWithProxy(url) {
        const proxies = [
            "https://api.allorigins.win/raw?url=",
            "https://cors-anywhere.herokuapp.com/"
        ];

        for (const proxy of proxies) {
            try {
                const proxyUrl = proxy + encodeURIComponent(url);
                const response = await fetch(proxyUrl, { 
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml',
                    }
                });
                
                if (response.ok) {
                    return await response.text();
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error("All CORS proxies failed");
    }

    getCachedDates() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < this.CACHE_DURATION) {
                return data.dates;
            }
        } catch (error) {
            console.warn('Cache read failed:', error);
        }
        return null;
    }

    cacheDates(dates) {
        try {
            const data = {
                dates: dates,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('Cache write failed:', error);
        }
    }

    getFallbackDates() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        // Smart fallback based on current time of year
        let startMonth, endMonth;
        
        if (currentMonth >= 0 && currentMonth <= 5) { // Jan-Jun
            startMonth = 10; // November
            endMonth = 11;   // December
        } else { // Jul-Dec
            startMonth = 10; // November
            endMonth = 11;   // December
        }
        
        const start = new Date(currentYear, startMonth, 1).getTime();
        const end = new Date(currentYear, endMonth, 30).getTime();
        
        return {
            start: start,
            end: end,
            source: 'smart_fallback_estimate',
            isEstimated: true
        };
    }

    // Manual override functions
    setManualDates(startDate, endDate) {
        const dates = {
            start: new Date(startDate).getTime(),
            end: new Date(endDate).getTime(),
            source: 'manual_override',
            isEstimated: false,
            timestamp: Date.now()
        };
        this.cacheDates(dates);
        return dates;
    }

    clearCache() {
        localStorage.removeItem(this.CACHE_KEY);
    }
}

// Initialize and expose
window.ExamDateScraper = EnhancedExamDateScraper;