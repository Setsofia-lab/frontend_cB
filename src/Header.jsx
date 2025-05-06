import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll to add shadow when scrolled
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Handle smooth scrolling to sections
    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false); // Close mobile menu after click
        }
    };

    return (
        <header className={isScrolled ? 'scrolled' : ''}>
            <div className="container">
                <h1 onClick={() => scrollToSection('hero')} className="logo">
                    codeBuddy
                </h1>
                
                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    <ul>
                        <li><a href="#problem-solution-section" onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('problem-solution-section');
                        }}>Problem</a></li>
                        <li><a href="#problem-solution-section" onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('problem-solution-section');
                        }}>Solution</a></li>
                        <li><a href="#features" onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('features');
                        }}>Features</a></li>
                        <li><a href="#demo" onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('demo');
                        }}>Demo</a></li>
                        <li><a href="#cta" onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('cta');
                        }}>Get Started</a></li>
                    </ul>
                </nav>
                
                {/* Mobile Menu Button */}
                <button 
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>
            
            {/* Mobile Menu - Moved outside the container for full-width display */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <ul>
                    <li><a href="#problem-solution-section" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('problem-solution-section');
                    }}>Problem</a></li>
                    <li><a href="#problem-solution-section" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('problem-solution-section');
                    }}>Solution</a></li>
                    <li><a href="#features" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('features');
                    }}>Features</a></li>
                    <li><a href="#demo" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('demo');
                    }}>Demo</a></li>
                    <li><a href="#cta" onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('cta');
                    }}>Get Started</a></li>
                </ul>
            </div>
        </header>
    );
};

export default Header;