import { Zap, ExternalLink, Link } from "lucide-react";

const footerLinks = {
  Platform: ["Roadmaps", "Certifications", "Courses", "YouTube Resources", "Books"],
  Fields: ["Cyber Security", "AI & ML", "Data Science", "Cloud", "DevOps"],
  Company: ["About", "Blog", "Contribute", "Changelog", "Open Source"],
  Support: ["Documentation", "Community", "Contact", "Privacy", "Terms"],
};

export default function Footer() {
  return (
    <footer className="border-t border-[#21262d] bg-[#0D1117] mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <span className="text-lg font-bold">
                Skill<span className="text-emerald-400">Forge</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Free and open-source platform for learning roadmaps, certifications, and career guidance.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/MshariSQ/skillforge"
                className="p-2 text-gray-500 hover:text-white border border-[#21262d] hover:border-gray-600 rounded-lg transition-all"
              >
                <ExternalLink size={16} />
              </a>
              <a
                href="#"
                className="p-2 text-gray-500 hover:text-white border border-[#21262d] hover:border-gray-600 rounded-lg transition-all"
              >
                <Link size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2025 SkillForge. Open source under MIT License.
          </p>
          <p className="text-sm text-gray-600">
            Built with ❤️ for learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
