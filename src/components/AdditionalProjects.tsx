import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';

const sideProjects = [
    { title: "Birla Capital", desc: "Redesigning financial tools", color: "bg-indigo-100" },
    { title: "ICAMPS", desc: "Bringing safety to mobile", color: "bg-rose-100" },
    { title: "Haqdarshak", desc: "Exploring government schemes", color: "bg-amber-100" },
    { title: "Spotify", desc: "Snippets and experiments", color: "bg-emerald-100" },
    { title: "Landing Page", desc: "Surprise! It's this one", color: "bg-cyan-100" },
];

const AdditionalProjects = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollXProgress } = useScroll({ container: containerRef });

    return (
        <section className="py-20 border-t border-gray-100 overflow-hidden">
            <div className="px-6 md:px-20 mb-12">
                <h2 className="text-2xl font-display font-bold">More fun stuff</h2>
            </div>

            <div
                ref={containerRef}
                className="flex overflow-x-auto gap-8 px-6 md:px-20 pb-12 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {sideProjects.map((project, index) => (
                    <motion.div
                        key={index}
                        className="flex-shrink-0 w-[300px] md:w-[400px] snap-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={`w-full aspect-[4/5] ${project.color} rounded-2xl mb-6`} />
                        <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                        <p className="text-gray-600">{project.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Scroll Indicator */}
            <div className="px-6 md:px-20 mt-8">
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-coral-500"
                        style={{ scaleX: scrollXProgress, transformOrigin: "0%" }}
                    />
                </div>
            </div>
        </section>
    );
};

export default AdditionalProjects;
