import { useState, useEffect, useRef } from "react";

const COLORS = {
    dark: "#0a0f0d",
    darkCard: "#0e1510",
    darkBorder: "#1a2e1f",
    green: "#2dcc70",
    greenDim: "#1a7a42",
    teal: "#00b8a0",
    white: "#f0f5f2",
    muted: "#6b8a74",
    accent: "#4fffb0",
};

const Logo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none">
        <defs>
            <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2dcc70" />
                <stop offset="100%" stopColor="#1a7a42" />
            </linearGradient>
            <linearGradient id="techGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00b8a0" />
                <stop offset="100%" stopColor="#0a4a40" />
            </linearGradient>
        </defs>
        <path d="M50 5 C50 5 10 30 10 75 C10 100 28 115 50 115 C72 115 90 100 90 75 C90 30 50 5 50 5Z" fill="url(#techGrad)" opacity="0.9" />
        <path d="M50 10 C50 10 18 38 22 75 C25 95 37 112 50 115 C50 115 50 60 30 35 C35 50 40 70 42 90 C44 78 46 62 50 10Z" fill="url(#leafGrad)" />
        <circle cx="72" cy="58" r="2.5" fill="#4fffb0" />
        <circle cx="78" cy="70" r="2" fill="#4fffb0" />
        <circle cx="65" cy="72" r="2" fill="#4fffb0" />
        <circle cx="74" cy="82" r="1.8" fill="#4fffb0" />
        <line x1="72" y1="58" x2="78" y2="70" stroke="#4fffb0" strokeWidth="1.2" opacity="0.7" />
        <line x1="72" y1="58" x2="65" y2="72" stroke="#4fffb0" strokeWidth="1.2" opacity="0.7" />
        <line x1="78" y1="70" x2="74" y2="82" stroke="#4fffb0" strokeWidth="1.2" opacity="0.7" />
        <line x1="65" y1="72" x2="74" y2="82" stroke="#4fffb0" strokeWidth="1.2" opacity="0.7" />
    </svg>
);

const useIntersect = (threshold = 0.15) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
};

const CountUp = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [ref, visible] = useIntersect(0.1);
    const started = useRef(false);

    useEffect(() => {
        if (visible && !started.current) {
            started.current = true;
            let startTime = null;
            const target = typeof end === 'string' ? parseFloat(end.replace(/,/g, '')) : end;
            
            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                // Power out curve for smoother finish
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeOut * target);
                setCount(current);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [visible, end, duration]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    );
};

const CustomCursor = () => {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        const over = (e) => {
            const target = e.target;
            if (target.closest('button, a, input, textarea, [onClick], [style*="cursor: pointer"]')) {
                setHovered(true);
            } else {
                setHovered(false);
            }
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseover", over);

        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseover", over);
        };
    }, []);

    return (
        <div style={{ pointerEvents: "none", position: "fixed", top: 0, left: 0, zIndex: 10000 }}>
            <div style={{
                width: "8px", height: "8px", background: COLORS.green, borderRadius: "50%",
                position: "absolute", transform: `translate(${pos.x - 4}px, ${pos.y - 4}px)`,
                transition: "transform 0.05s linear",
            }} />
            <div style={{
                width: hovered ? "48px" : "28px", height: hovered ? "48px" : "28px",
                border: `1px solid ${COLORS.green}`, borderRadius: "50%",
                position: "absolute", transform: `translate(${pos.x - (hovered ? 24 : 14)}px, ${pos.y - (hovered ? 24 : 14)}px)`,
                transition: "all 0.15s ease-out",
                opacity: 0.4,
                background: hovered ? `rgba(45, 204, 112, 0.1)` : "transparent",
            }} />
        </div>
    );
};

const FadeIn = ({ children, delay = 0, style = {} }) => {
    const [ref, visible] = useIntersect();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
            ...style
        }}>
            {children}
        </div>
    );
};

const Nav = ({ page, setPage }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);
    const links = ["Home", "About", "Contact"];
    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            background: scrolled ? "rgba(10,15,13,0.95)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? `1px solid ${COLORS.darkBorder}` : "none",
            transition: "all 0.4s ease",
            padding: "0 clamp(1.5rem, 5vw, 4rem)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: "72px",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setPage("Home")}>
                <Logo size={36} />
                <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", fontWeight: 700, color: COLORS.white, letterSpacing: "0.12em" }}>PANAMA</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", fontWeight: 700, color: COLORS.green, letterSpacing: "0.12em", marginTop: "-2px" }}>HYDROX</div>
                </div>
            </div>
            <div style={{ display: "flex", gap: "2.5rem" }}>
                {links.map(l => (
                    <button key={l} onClick={() => setPage(l)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: "13px", letterSpacing: "0.14em",
                        textTransform: "uppercase", fontWeight: 500,
                        color: page === l ? COLORS.green : COLORS.muted,
                        borderBottom: page === l ? `1px solid ${COLORS.green}` : "1px solid transparent",
                        paddingBottom: "2px",
                        transition: "all 0.3s ease",
                    }}>{l}</button>
                ))}
            </div>
        </nav>
    );
};

const HomePage = ({ setPage }) => {
    const stats = [
        { value: 5000, suffix: "", unit: "acres", label: "crop loss that sparked a revolution" },
        { value: 90, suffix: "%", unit: "", label: "less water vs. conventional farming" },
        { value: 3, suffix: "×", unit: "", label: "higher bioactive compound yield" },
        { value: 365, suffix: "", unit: "days", label: "year-round production capability" },
    ];

    const crops = [
        { name: "Saffron", desc: "The world's most valuable spice, precision-grown for pharmaceutical-grade quality.", image: "/images/saffron.png" },
        { name: "Ashwagandha", desc: "Standardised withanolide content — every batch, every time.", image: "/images/ashwagandha.png" },
        { name: "Cordyceps", desc: "Medicinal fungi cultivated in fully controlled bio-environments.", image: "/images/cordyceps.png" },
    ];

    const pillars = [
        { title: "Precision Control", body: "Every variable — light spectrum, nutrient density, CO₂, humidity, temperature — engineered to specification.", icon: "⚙️" },
        { title: "Pharmaceutical Grade", body: "We don't produce harvests. We produce standardised bioactive compounds with documented consistency.", icon: "🔬" },
        { title: "Scalable Intelligence", body: "The cultivation protocols we build today become replicable technology platforms tomorrow.", icon: "📡" },
    ];

    return (
        <div style={{ background: COLORS.dark, minHeight: "100vh", color: COLORS.white, fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            {/* Hero */}
            <section style={{
                minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "120px clamp(1.5rem, 8vw, 8rem) 80px",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundImage: 'url("/images/hero.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.15,
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", top: 0, right: 0, width: "55%", height: "100%",
                    background: "radial-gradient(ellipse at 70% 40%, rgba(45,204,112,0.12) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: "-100px", left: "-100px", width: "500px", height: "500px",
                    background: "radial-gradient(circle, rgba(0,184,160,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{ maxWidth: "780px", position: "relative" }}>
                    <div style={{
                        display: "inline-block", padding: "6px 18px", marginBottom: "2rem",
                        border: `1px solid ${COLORS.darkBorder}`, borderRadius: "2px",
                        fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.2em",
                        textTransform: "uppercase", color: COLORS.green,
                    }}>Intelligent Hydroponics · Limitless Growth</div>

                    <h1 style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 700, lineHeight: 1.05,
                        margin: "0 0 2rem", color: COLORS.white,
                    }}>
                        What if agriculture<br />
                        <span style={{ color: COLORS.green }}>behaved like</span><br />
                        manufacturing?
                    </h1>

                    <p style={{ fontSize: "1.1rem", lineHeight: 1.9, color: COLORS.muted, maxWidth: "560px", margin: "0 0 3rem", fontWeight: 300 }}>
                        We didn't start Panama HydroX as a technology company. We started it because agriculture failed us — and we decided to rebuild it from first principles.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <button onClick={() => setPage("About")} style={{
                            padding: "14px 32px", background: COLORS.green, color: COLORS.dark,
                            border: "none", borderRadius: "2px", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            transition: "all 0.3s ease",
                        }}
                            onMouseEnter={e => e.target.style.background = COLORS.accent}
                            onMouseLeave={e => e.target.style.background = COLORS.green}
                        >Our Story</button>
                        <button onClick={() => setPage("Contact")} style={{
                            padding: "14px 32px", background: "transparent", color: COLORS.white,
                            border: `1px solid ${COLORS.darkBorder}`, borderRadius: "2px", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            transition: "all 0.3s ease",
                        }}
                            onMouseEnter={e => { e.target.style.borderColor = COLORS.green; e.target.style.color = COLORS.green; }}
                            onMouseLeave={e => { e.target.style.borderColor = COLORS.darkBorder; e.target.style.color = COLORS.white; }}
                        >Investor Enquiry</button>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: COLORS.muted, textTransform: "uppercase" }}>Scroll</span>
                    <div style={{ width: "1px", height: "48px", background: `linear-gradient(${COLORS.green}, transparent)`, animation: "pulse 2s infinite" }} />
                </div>
            </section>

            {/* Stats */}
            <section style={{ padding: "80px clamp(1.5rem, 8vw, 8rem)", borderTop: `1px solid ${COLORS.darkBorder}`, borderBottom: `1px solid ${COLORS.darkBorder}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
                    {stats.map((s, i) => (
                        <FadeIn key={i} delay={i * 0.1}>
                            <div style={{ transition: "transform 0.3s ease" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                <div style={{
                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                                    fontWeight: 700,
                                    color: COLORS.green,
                                    lineHeight: 1,
                                    textShadow: `0 0 20px rgba(45, 204, 112, 0.2)`
                                }}>
                                    <CountUp end={s.value} suffix={s.suffix} />
                                    <span style={{ fontSize: "1rem", color: COLORS.teal, marginLeft: "4px" }}>{s.unit}</span>
                                </div>
                                <div style={{ fontSize: "13px", color: COLORS.muted, marginTop: "0.75rem", lineHeight: 1.6, maxWidth: "180px" }}>{s.label}</div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* The Problem / Origin */}
            <section style={{ padding: "100px clamp(1.5rem, 8vw, 8rem)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
                    <FadeIn>
                        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1.5rem" }}>The Origin</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, margin: "0 0 2rem" }}>
                            A single climate event.<br />5,000 acres. Gone.
                        </h2>
                        <p style={{ fontSize: "1rem", lineHeight: 1.9, color: COLORS.muted, fontWeight: 300, margin: "0 0 1.5rem" }}>
                            In 2013–14, one climate event wiped out an entire ginger crop. Not because demand was absent. Not because farmers didn't work hard. But because agriculture, as it exists today, is fundamentally unpredictable.
                        </p>
                        <p style={{ fontSize: "1rem", lineHeight: 1.9, color: COLORS.muted, fontWeight: 300 }}>
                            That moment exposed a deeper truth about the global supply chain. For pharmaceutical companies depending on medicinal plants, this isn't an inconvenience — it's a systemic risk.
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                background: COLORS.darkCard, border: `1px solid ${COLORS.darkBorder}`, borderRadius: "4px",
                                padding: "2.5rem",
                            }}>
                                <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.teal, marginBottom: "1.5rem" }}>The Global Problem</div>
                                {[
                                    "Inconsistent quality across batches",
                                    "Volatile supply due to climate dependency",
                                    "Zero control over bioactive compound yield",
                                    "No standardised raw material at scale",
                                ].map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 0", borderBottom: i < 3 ? `1px solid ${COLORS.darkBorder}` : "none" }}>
                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: COLORS.green, marginTop: "6px", flexShrink: 0 }} />
                                        <span style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.6 }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{
                                position: "absolute", bottom: "-1.5rem", right: "-1.5rem",
                                background: `linear-gradient(135deg, ${COLORS.greenDim}, ${COLORS.teal})`,
                                borderRadius: "4px", padding: "1rem 1.5rem",
                                fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: COLORS.white,
                                fontStyle: "italic",
                            }}>"Quality defines value.<br />Consistency defines trust."</div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Our Crops */}
            <section style={{ padding: "80px clamp(1.5rem, 8vw, 8rem)", background: COLORS.darkCard, borderTop: `1px solid ${COLORS.darkBorder}`, borderBottom: `1px solid ${COLORS.darkBorder}` }}>
                <FadeIn>
                    <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1rem" }}>Focus Crops</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 600 }}>
                            We are not growing lettuce.
                        </h2>
                    </div>
                </FadeIn>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    {crops.map((c, i) => (
                        <FadeIn key={c.name} delay={i * 0.15}>
                            <div style={{
                                background: COLORS.dark, border: `1px solid ${COLORS.darkBorder}`, borderRadius: "4px",
                                padding: "2rem", transition: "all 0.4s ease",
                                cursor: "default", overflow: "hidden"
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = COLORS.green;
                                    e.currentTarget.querySelector('img').style.transform = "scale(1.05)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = COLORS.darkBorder;
                                    e.currentTarget.querySelector('img').style.transform = "scale(1)";
                                }}
                            >
                                <div style={{ height: "180px", marginBottom: "1.5rem", borderRadius: "2px", overflow: "hidden", border: `1px solid ${COLORS.darkBorder}` }}>
                                    <img src={c.image} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7, transition: "transform 0.6s ease" }} />
                                </div>
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 600, color: COLORS.white, margin: "0 0 1rem" }}>{c.name}</h3>
                                <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.8, margin: 0 }}>{c.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* Three Pillars */}
            <section style={{ padding: "100px clamp(1.5rem, 8vw, 8rem)" }}>
                <FadeIn>
                    <div style={{ marginBottom: "4rem" }}>
                        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1rem" }}>Our Model</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 600, margin: 0 }}>
                            Simple, but powerful.
                        </h2>
                    </div>
                </FadeIn>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
                    {pillars.map((p, i) => (
                        <FadeIn key={p.title} delay={i * 0.15}>
                            <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: `2px solid ${i === 1 ? COLORS.green : COLORS.darkBorder}` }}>
                                <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{p.icon}</div>
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: COLORS.white, margin: "0 0 0.75rem" }}>{p.title}</h3>
                                <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.8, margin: 0 }}>{p.body}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: "100px clamp(1.5rem, 8vw, 8rem)", textAlign: "center", borderTop: `1px solid ${COLORS.darkBorder}` }}>
                <FadeIn>
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1.5rem" }}>The Journey</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, lineHeight: 1.2, margin: "0 0 2rem" }}>
                            We don't just build a company.<br />
                            <span style={{ color: COLORS.green }}>We build a new category.</span>
                        </h2>
                        <p style={{ fontSize: "1rem", color: COLORS.muted, lineHeight: 1.9, margin: "0 0 3rem", fontWeight: 300 }}>
                            From uncertainty to precision. From variability to standardisation. From farming to controlled bio-production.
                        </p>
                        <button onClick={() => setPage("Contact")} style={{
                            padding: "16px 48px", background: "transparent", color: COLORS.green,
                            border: `1px solid ${COLORS.green}`, borderRadius: "2px", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
                            letterSpacing: "0.15em", textTransform: "uppercase",
                            transition: "all 0.3s ease",
                        }}
                            onMouseEnter={e => { e.target.style.background = COLORS.green; e.target.style.color = COLORS.dark; }}
                            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = COLORS.green; }}
                        >Connect With Us</button>
                    </div>
                </FadeIn>
            </section>

            <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
        </div>
    );
};

const AboutPage = () => {
    const timeline = [
        { year: "2013–14", event: "Climate Event", desc: "A single weather event destroys 5,000 acres of ginger crops, exposing the fragility of conventional agriculture and sparking a fundamental question about food system design." },
        { year: "2019", event: "Research Phase", desc: "Deep investigation into controlled environment agriculture, hydroponics, and pharmaceutical-grade cultivation standards begins. First prototype systems designed." },
        { year: "2021", event: "Panama HydroX Founded", desc: "Formal incorporation. The mission crystallises: not just growing plants, but engineering biological production with manufacturing-grade consistency." },
        { year: "2023", event: "First Harvests", desc: "Proof-of-concept harvests of saffron and ashwagandha demonstrate consistent bioactive compound profiles across multiple growth cycles." },
        { year: "2025+", event: "Scale & Standardise", desc: "B2B partnerships with pharmaceutical and nutraceutical buyers. Building the intelligence layer for technology replication and global expansion." },
    ];

    const values = [
        { title: "Technology", body: "Precision sensor networks, AI-driven nutrient delivery, and environmental control systems that eliminate variability." },
        { title: "Sustainability", body: "90% less water. No pesticides. Zero soil degradation. Responsible production that improves — not depletes." },
        { title: "Efficiency", body: "Year-round production cycles. Three times the yield per square meter. Maximum output, minimum input." },
        { title: "Abundance", body: "Standardised supply at scale, enabling pharmaceutical and nutraceutical industries to plan with confidence." },
    ];

    return (
        <div style={{ background: COLORS.dark, minHeight: "100vh", color: COLORS.white, fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            {/* Hero */}
            <section style={{
                padding: "160px clamp(1.5rem, 8vw, 8rem) 100px",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundImage: 'url("/images/mission.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.1,
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
                    background: "radial-gradient(ellipse at 80% 30%, rgba(45,204,112,0.1) 0%, transparent 60%)",
                    pointerEvents: "none",
                }} />
                <div style={{ maxWidth: "700px", position: "relative" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "2rem" }}>About Panama HydroX</div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 2rem" }}>
                        Precision.<br />Sustainability.<br /><span style={{ color: COLORS.green }}>Prosperity.</span>
                    </h1>
                    <p style={{ fontSize: "1.1rem", lineHeight: 1.9, color: COLORS.muted, fontWeight: 300, maxWidth: "540px" }}>
                        Four years of deep investment into a single question: can we make biological production as predictable and consistent as industrial manufacturing?
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section style={{ padding: "100px clamp(1.5rem, 8vw, 8rem)", background: COLORS.darkCard, borderTop: `1px solid ${COLORS.darkBorder}`, borderBottom: `1px solid ${COLORS.darkBorder}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "6rem", alignItems: "center" }}>
                    <FadeIn>
                        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1.5rem" }}>Our Mission</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 600, lineHeight: 1.3, margin: "0 0 1.5rem" }}>
                            To move agriculture from uncertainty to precision.
                        </h2>
                        <p style={{ fontSize: "1rem", lineHeight: 1.9, color: COLORS.muted, fontWeight: 300 }}>
                            The global medicinal plant and nutraceutical market is expanding rapidly, but constrained by one fundamental problem: no reliable, standardised supply at scale. That gap is our entry point.
                        </p>
                        <p style={{ fontSize: "1rem", lineHeight: 1.9, color: COLORS.muted, fontWeight: 300, marginTop: "1rem", marginBottom: "2.5rem" }}>
                            We are not interested in disruption for its own sake. We are interested in proving that controlled bio-production — when done right — can outperform conventional agriculture on every metric that matters to pharmaceutical buyers.
                        </p>
                        <div style={{ borderLeft: `1px solid ${COLORS.darkBorder}`, paddingLeft: "2rem" }}>
                            <blockquote style={{
                                fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 400,
                                fontStyle: "italic", lineHeight: 1.6, color: COLORS.white, margin: "0 0 1rem",
                                borderLeft: `3px solid ${COLORS.green}`, paddingLeft: "1.5rem",
                            }}>
                                "In an AI-first world, the most meaningful impact will come from applying intelligence to the most unpredictable systems — like agriculture."
                            </blockquote>
                            <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: COLORS.muted, textTransform: "uppercase" }}>Panama HydroX · Founding Philosophy</div>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: "100%", height: "500px", borderRadius: "4px", overflow: "hidden",
                                border: `1px solid ${COLORS.darkBorder}`
                            }}>
                                <img src="/images/philosophy.png" alt="Founding Philosophy" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                            </div>
                            <div style={{
                                position: "absolute", bottom: "-2rem", left: "-2rem",
                                background: COLORS.dark, border: `1px solid ${COLORS.darkBorder}`,
                                padding: "2rem", maxWidth: "240px", borderRadius: "2px"
                            }}>
                                <div style={{ color: COLORS.green, fontSize: "1.5rem", marginBottom: "0.5rem" }}>90%</div>
                                <div style={{ color: COLORS.muted, fontSize: "12px", lineHeight: 1.5 }}>Reduction in water consumption compared to traditional soil farming.</div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Timeline */}
            <section style={{ padding: "100px clamp(1.5rem, 8vw, 8rem)" }}>
                <FadeIn>
                    <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1rem" }}>Our Journey</div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 600, margin: "0 0 4rem" }}>
                        From crisis to category creation.
                    </h2>
                </FadeIn>
                <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "0", top: "12px", bottom: "12px", width: "1px", background: `linear-gradient(${COLORS.green}, ${COLORS.darkBorder})` }} />
                    {timeline.map((t, i) => (
                        <FadeIn key={t.year} delay={i * 0.1}>
                            <div style={{ display: "flex", gap: "2.5rem", marginBottom: "3.5rem", paddingLeft: "2.5rem", position: "relative" }}>
                                <div style={{
                                    position: "absolute", left: "-5px", top: "8px",
                                    width: "10px", height: "10px", borderRadius: "50%",
                                    background: i === 0 ? COLORS.green : COLORS.darkBorder,
                                    border: `2px solid ${i === 0 ? COLORS.green : COLORS.muted}`,
                                }} />
                                <div style={{ minWidth: "80px" }}>
                                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700, color: COLORS.green }}>{t.year}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.white, marginBottom: "0.5rem" }}>{t.event}</div>
                                    <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.8, margin: 0, maxWidth: "520px" }}>{t.desc}</p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: "80px clamp(1.5rem, 8vw, 8rem)", background: COLORS.darkCard, borderTop: `1px solid ${COLORS.darkBorder}` }}>
                <FadeIn>
                    <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1rem" }}>Core Values</div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 600, margin: "0 0 4rem" }}>
                        Technology. Sustainability. Efficiency. Abundance.
                    </h2>
                </FadeIn>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
                    {values.map((v, i) => (
                        <FadeIn key={v.title} delay={i * 0.1} style={{ flex: "1 1 280px", maxWidth: "320px" }}>
                            <div style={{
                                background: COLORS.dark, border: `1px solid ${COLORS.darkBorder}`, borderRadius: "4px",
                                padding: "2rem", transition: "border-color 0.3s ease",
                                height: "100%", boxSizing: "border-box"
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.greenDim}
                                onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.darkBorder}
                            >
                                <div style={{ width: "32px", height: "2px", background: COLORS.green, marginBottom: "1.5rem" }} />
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: COLORS.white, margin: "0 0 1rem" }}>{v.title}</h3>
                                <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.8, margin: 0 }}>{v.body}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* Vision */}
            <section style={{ padding: "100px clamp(1.5rem, 8vw, 8rem)", textAlign: "center", borderTop: `1px solid ${COLORS.darkBorder}` }}>
                <FadeIn>
                    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 400, lineHeight: 1.5, color: COLORS.muted, fontStyle: "italic", marginBottom: "3rem" }}>
                            "Once consistency is proven,<br />
                            <span style={{ color: COLORS.white, fontWeight: 600 }}>scale becomes inevitable.</span>"
                        </div>
                        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.muted, marginBottom: "8px" }}>Phase 1</div>
                                <div style={{ fontSize: "14px", color: COLORS.white }}>Produce & Validate</div>
                            </div>
                            <div style={{ color: COLORS.darkBorder, display: "flex", alignItems: "center" }}>→</div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.muted, marginBottom: "8px" }}>Phase 2</div>
                                <div style={{ fontSize: "14px", color: COLORS.white }}>Extract & Compound</div>
                            </div>
                            <div style={{ color: COLORS.darkBorder, display: "flex", alignItems: "center" }}>→</div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.muted, marginBottom: "8px" }}>Phase 3</div>
                                <div style={{ fontSize: "14px", color: COLORS.green }}>Scale Intelligence</div>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </section>
        </div>
    );
};

const ContactPage = () => {
    const [form, setForm] = useState({ name: "", org: "", email: "", type: "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [focused, setFocused] = useState("");

    const inputStyle = (field) => ({
        width: "100%", padding: "14px 0", background: "transparent",
        border: "none", borderBottom: `1px solid ${focused === field ? COLORS.green : COLORS.darkBorder}`,
        color: COLORS.white, fontFamily: "'DM Sans', sans-serif", fontSize: "15px",
        outline: "none", transition: "border-color 0.3s ease", boxSizing: "border-box",
    });

    const labelStyle = {
        display: "block", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
        color: COLORS.muted, marginBottom: "8px",
    };

    const handleSubmit = () => {
        if (form.name && form.email && form.message) setSubmitted(true);
    };

    const enquiryTypes = [
        { val: "investor", label: "Investor Relations" },
        { val: "partner", label: "B2B Partnership" },
        { val: "buyer", label: "Product Buyer" },
        { val: "media", label: "Media / Press" },
        { val: "other", label: "General Enquiry" },
    ];

    const offices = [
        { city: "Panama City", detail: "Regional Headquarters, Central America Operations" },
        { city: "Mumbai", detail: "Asia-Pacific Research & Development Hub" },
    ];

    return (
        <div style={{ background: COLORS.dark, minHeight: "100vh", color: COLORS.white, fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            {/* Hero */}
            <section style={{ padding: "160px clamp(1.5rem, 8vw, 8rem) 80px", position: "relative" }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    background: "radial-gradient(ellipse at 30% 60%, rgba(0,184,160,0.05) 0%, transparent 60%)",
                    pointerEvents: "none",
                }} />
                <div style={{ maxWidth: "600px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "2rem" }}>Get In Touch</div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 2rem" }}>
                        Let's build the future of<br /><span style={{ color: COLORS.green }}>bio-production</span> together.
                    </h1>
                    <p style={{ fontSize: "1rem", lineHeight: 1.9, color: COLORS.muted, fontWeight: 300 }}>
                        Whether you're an investor, a pharmaceutical buyer, or a potential strategic partner — we are selective, purposeful, and open to the right conversations.
                    </p>
                </div>
            </section>

            <section style={{ padding: "0 clamp(1.5rem, 8vw, 8rem) 100px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "6rem", alignItems: "start" }}>

                    {/* Form */}
                    <FadeIn>
                        {submitted ? (
                            <div style={{
                                background: COLORS.darkCard, border: `1px solid ${COLORS.greenDim}`, borderRadius: "4px",
                                padding: "4rem", textAlign: "center",
                            }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>✓</div>
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 600, color: COLORS.green, margin: "0 0 1rem" }}>Message Received</h3>
                                <p style={{ fontSize: "15px", color: COLORS.muted, lineHeight: 1.8 }}>
                                    Thank you for reaching out. Our team reviews enquiries carefully and will respond within 3–5 business days.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 2rem" }}>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <label style={labelStyle}>Full Name *</label>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                                            placeholder="Your full name" style={inputStyle("name")} />
                                    </div>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <label style={labelStyle}>Organisation</label>
                                        <input value={form.org} onChange={e => setForm({ ...form, org: e.target.value })}
                                            onFocus={() => setFocused("org")} onBlur={() => setFocused("")}
                                            placeholder="Company or institution" style={inputStyle("org")} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: "2rem" }}>
                                    <label style={labelStyle}>Email Address *</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                                        placeholder="your@email.com" style={inputStyle("email")} />
                                </div>
                                <div style={{ marginBottom: "2rem" }}>
                                    <label style={labelStyle}>Nature of Enquiry</label>
                                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                                        {enquiryTypes.map(t => (
                                            <button key={t.val} onClick={() => setForm({ ...form, type: t.val })} style={{
                                                padding: "8px 16px", background: form.type === t.val ? COLORS.greenDim : "transparent",
                                                border: `1px solid ${form.type === t.val ? COLORS.green : COLORS.darkBorder}`,
                                                borderRadius: "2px", cursor: "pointer",
                                                color: form.type === t.val ? COLORS.white : COLORS.muted,
                                                fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
                                                transition: "all 0.25s ease",
                                            }}>{t.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: "3rem" }}>
                                    <label style={labelStyle}>Message *</label>
                                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                        onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                                        placeholder="Tell us about your interest, use case, or question…"
                                        rows={6} style={{ ...inputStyle("message"), resize: "vertical", lineHeight: 1.8 }} />
                                </div>
                                <button onClick={handleSubmit} style={{
                                    padding: "16px 48px", background: COLORS.green, color: COLORS.dark,
                                    border: "none", borderRadius: "2px", cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
                                    letterSpacing: "0.15em", textTransform: "uppercase",
                                    transition: "all 0.3s ease",
                                }}
                                    onMouseEnter={e => e.target.style.background = COLORS.accent}
                                    onMouseLeave={e => e.target.style.background = COLORS.green}
                                >Send Enquiry</button>
                            </div>
                        )}
                    </FadeIn>

                    {/* Sidebar */}
                    <FadeIn delay={0.2}>
                        <div>
                            <div style={{ marginBottom: "3rem" }}>
                                <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1.5rem" }}>Direct Contact</div>
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Investor Relations</div>
                                    <div style={{ fontSize: "15px", color: COLORS.white }}>invest@panamahydrox.com</div>
                                </div>
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Partnerships</div>
                                    <div style={{ fontSize: "15px", color: COLORS.white }}>partners@panamahydrox.com</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "12px", color: COLORS.muted, marginBottom: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>General</div>
                                    <div style={{ fontSize: "15px", color: COLORS.white }}>hello@panamahydrox.com</div>
                                </div>
                            </div>

                            <div style={{ borderTop: `1px solid ${COLORS.darkBorder}`, paddingTop: "3rem", marginBottom: "3rem" }}>
                                <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1.5rem" }}>Locations</div>
                                {offices.map((o, i) => (
                                    <div key={o.city} style={{ marginBottom: "1.5rem" }}>
                                        <div style={{ fontSize: "15px", color: COLORS.white, fontWeight: 500, marginBottom: "4px" }}>{o.city}</div>
                                        <div style={{ fontSize: "13px", color: COLORS.muted, lineHeight: 1.6 }}>{o.detail}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: COLORS.darkCard, border: `1px solid ${COLORS.darkBorder}`,
                                borderRadius: "4px", padding: "2rem",
                                borderLeft: `3px solid ${COLORS.green}`,
                            }}>
                                <div style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: COLORS.green, marginBottom: "1rem" }}>Investor Note</div>
                                <p style={{ fontSize: "13px", color: COLORS.muted, lineHeight: 1.8, margin: 0 }}>
                                    We are currently in active conversations with strategic investors who share our vision for standardised pharmaceutical-grade bio-production. If that resonates, we'd love to connect.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
};

const Footer = ({ setPage }) => (
    <footer style={{
        background: COLORS.darkCard, borderTop: `1px solid ${COLORS.darkBorder}`,
        padding: "3rem clamp(1.5rem, 8vw, 8rem)",
        fontFamily: "'DM Sans', sans-serif",
    }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Logo size={28} />
                <div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: COLORS.white, letterSpacing: "0.12em" }}>PANAMA </span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: COLORS.green, letterSpacing: "0.12em" }}>HYDROX</span>
                    <div style={{ fontSize: "10px", color: COLORS.muted, letterSpacing: "0.12em", marginTop: "2px" }}>INTELLIGENT HYDROPONICS · LIMITLESS GROWTH</div>
                </div>
            </div>
            <div style={{ display: "flex", gap: "2rem" }}>
                {["Home", "About", "Contact"].map(l => (
                    <button key={l} onClick={() => setPage(l)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: "12px", color: COLORS.muted, letterSpacing: "0.1em",
                        fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                        transition: "color 0.3s ease",
                    }}
                        onMouseEnter={e => e.target.style.color = COLORS.green}
                        onMouseLeave={e => e.target.style.color = COLORS.muted}
                    >{l}</button>
                ))}
            </div>
            <div style={{ fontSize: "11px", color: COLORS.muted }}>© 2025 Panama HydroX. All rights reserved.</div>
        </div>
    </footer>
);

export default function App() {
    const [page, setPage] = useState("Home");
    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);

    return (
        <div style={{ background: COLORS.dark, minHeight: "100vh" }}>
            <CustomCursor />
            <Nav page={page} setPage={setPage} />
            {page === "Home" && <HomePage setPage={setPage} />}
            {page === "About" && <AboutPage />}
            {page === "Contact" && <ContactPage />}
            <Footer setPage={setPage} />
        </div>
    );
}