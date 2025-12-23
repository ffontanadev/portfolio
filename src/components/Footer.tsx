import { HeartIcon } from '@/components/ui/heart';

const Footer = () => {
    return (
        <footer className="bg-white py-16 px-6 md:px-20 border-t border-gray-100">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-8">
                <div className="text-4xl font-display font-bold tracking-tighter">
                    FF.
                </div>

                <div className="flex gap-8 flex-wrap justify-center">
                    <a href="#hero" className="text-dark-900 hover:text-coral-500 transition-colors">Home</a>
                    <a href="#work" className="text-dark-900 hover:text-coral-500 transition-colors">Work</a>
                    <a href="#about" className="text-dark-900 hover:text-coral-500 transition-colors">About</a>
                    <a href="#connect" className="text-dark-900 hover:text-coral-500 transition-colors">Connect</a>
                    <a href="/resume.pdf" className="text-dark-900 hover:text-coral-500 transition-colors">Resume</a>
                </div>

                <div className="flex items-center gap-2 text-gray-500 text-sm mt-8">
                    <span>Made with</span>
                    <HeartIcon size={16} className="fill-coral-500 text-coral-500" />
                    <span>and React</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
