import { motion } from "framer-motion";
import { Zap, Github, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
  Product: ["Features", "PvP Arena", "Community", "Pricing", "Roadmap"],
  Resources: ["Documentation", "API", "Blog", "Tutorials", "Help Center"],
  Company: ["About", "Careers", "Press", "Contact", "Partners"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export const Footer = () => {
  return (
    <footer className="relative py-16 px-4 border-t border-border/50">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <motion.a
              href="/"
              className="inline-block mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <Logo animated={false} iconSize="w-10 h-10" textClassName="font-display font-bold text-xl" />
            </motion.a>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              The ultimate platform for skill development, social collaboration, 
              and competitive PvP challenges.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass-card p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-display font-semibold text-foreground">
                  Stay Updated
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get the latest updates on new features and competitions.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            © 2024 Nexora. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Status
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Changelog
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Feedback
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
