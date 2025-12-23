import { LinkedinIcon } from '@/components/ui/linkedin';
import { TwitterIcon } from '@/components/ui/twitter';
import { DownloadIcon } from '@/components/ui/download';
import { useAppContext } from '@/contexts/AppContext';

const Contact = () => {
    const { openResume } = useAppContext();
    return (
        <section id="connect" className="py-32 px-6 md:px-20 bg-cream-100 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-coral-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />
            </div>

            <div className="max-w-2xl mx-auto text-center relative z-10">
                <p className="text-gray-500 italic mb-8">you made it this far</p>

                <h2 className="text-5xl md:text-6xl font-display font-bold mb-12">
                    Come say hi!
                </h2>

                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-white/60">
                    <p className="text-lg font-medium mb-6">I'm available for</p>
                    <ul className="space-y-4 text-left inline-block mx-auto">
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>full time work as a developer</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>freelance work</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>digital solutions requests</span>
                        </li>
                    </ul>
                </div>

                <p className="text-gray-600 italic mb-10 max-w-lg mx-auto">
                    ...and I'm always up for discussing about music or trying a new game together!
                </p>

                <div className="flex flex-col items-center gap-6 group">
                    <button
                        onClick={openResume}
                        className="flex items-center gap-2 bg-dark-900 text-white px-8 py-4 rounded-full font-bold hover:bg-coral-500 transition-colors cursor-pointer"
                    >
                        <DownloadIcon size={20} />
                        View Resume
                    </button>

                    <a
                        href="mailto:monishakalairajesh@gmail.com"
                        className="text-xl font-medium hover:text-coral-500 transition-colors"
                    >
                        contacto@ffontana.dev
                    </a>

                    <div className="flex gap-6 mt-4">
                        <a href="#" className="p-3 bg-white rounded-full hover:text-coral-500 hover:shadow-md transition-all">
                            <LinkedinIcon size={24} />
                        </a>
                        <a href="#" className="p-3 bg-white rounded-full hover:text-coral-500 hover:shadow-md transition-all">
                            <TwitterIcon size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
