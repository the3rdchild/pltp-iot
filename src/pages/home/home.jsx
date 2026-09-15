import { useState } from 'react';
import Sidebar from '../../components/home/Sidebar';
import Header from '../../components/home/Header';
import HeroSection from '../../components/home/HeroSection';
import MissionSection from '../../components/home/MissionSection';
import ServicesSection from '../../components/home/ServicesSection';
import PltpWorksSection from '../../components/home/PltpWorksSection';
import QualitySection from '../../components/home/QualitySection';
import SamplingSection from '../../components/home/SamplingSection';
import AiMonitoringSection from '../../components/home/AiMonitoringSection';
import TeamSection from '../../components/home/TeamSection';
import CollaborationSection from '../../components/home/CollaborationSection';
import Footer from '../../components/home/Footer';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`home ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onOpenHamburger={() => setIsSidebarOpen(true)} onCloseSidebar={() => setIsSidebarOpen(false)} />

      <Header />
      <HeroSection />
      <MissionSection />
      <ServicesSection />
      <PltpWorksSection />
      <QualitySection />
      <SamplingSection />
      <AiMonitoringSection />
      <TeamSection />
      <CollaborationSection />
      <Footer />

      <style jsx>{`
        .home {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background-color: #ffffff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header */
        .header {
          background-color: #1a2642;
          color: white;
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logos {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-logo {
          height: 48px;
          width: auto;
          filter: brightness(0) invert(1);
        }

        /* Hamburger Menu */
        .hamburger-menu {
          position: fixed;
          top: 24px;
          left: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          z-index: 1001;
          padding: 8px;
          border-radius: 8px;
          background: rgba(26, 38, 66, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .hamburger-menu:hover {
          background: rgba(37, 99, 235, 0.9);
        }

        .hamburger-line {
          width: 24px;
          height: 3px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: -280px;
          width: 280px;
          height: 100vh;
          background: rgba(26, 38, 66, 0.98);
          backdrop-filter: blur(20px);
          z-index: 1000;
          transition: left 0.3s ease;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
          overflow-y: auto;
        }

        .sidebar.open {
          left: 0;
        }

        .sidebar-content {
          padding: 80px 24px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link {
          color: white;
          text-decoration: none;
          padding: 16px 20px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: block;
        }

        .sidebar-link:hover {
          background: rgba(37, 99, 235, 0.2);
          color: #2563eb;
          transform: translateX(8px);
        }

        /* Dropdown Lokasi */
        .nav-dropdown {
          position: relative;
        }

        .dropdown-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 400;
          font-size: 1rem;
          font-family: inherit;
          color: white;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #1a2642;
          min-width: 180px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-top: 0;
          padding-top: 8px;
          z-index: 1;
        }

        .nav-dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-content a {
          color: white;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          transition: all 0.3s ease;
        }

        .dropdown-content a:hover {
          background: #2563eb;
          color: white;
        }

        .dropdown-content a:first-child {
          border-radius: 8px 8px 0 0;
        }

        .dropdown-content a:last-child {
          border-radius: 0 0 8px 8px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 48px;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 400;
          font-size: 1rem;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
        }

        .nav-link:hover {
          color: #f7941d;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          padding: 64px 0;
        }

        .brand-logos {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .brand-logo {
          height: 50px;
          width: auto;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .hero-highlight {
          color: #2563eb;
        }

        .hero-content-wrapper {
          margin-top: 48px;
          margin-left: auto;
          margin-right: 0;
          max-width: 1100px;
          padding-left: 100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .hero-text {
          color: #495057;
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .hero-image-container {
          margin-top: 68px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .hero-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          object-position: bottom;
        }

        /* Mission Section */
        .mission-section {
          padding: 80px 0;
          background: rgba(184, 184, 184, 0.15);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
        }

        .section-intro {
          font-size: 1.125rem;
          color: #495057;
          line-height: 1.8;
          margin-bottom: 48px;
          max-width: 900px;
          text-align: justify
        }

        .mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: stretch;
        }

        .mission-cards {
          display: contents;
        }

        .mission-card {
          background: transparent;
          padding: 24px;
          transition: all 0.3s ease;
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }

        .mission-icon {
          background: #2563eb;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          color: white;
        }

        .mission-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .mission-card-text {
          font-size: 0.875rem;
          color: #495057;
          line-height: 1.6;
        }

        .engineer-image-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          min-height: 320px;
          height: 100%;
        }

        .engineer-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 160% center;
          transform: scale(1.5);
        }

        .mission-button-container {
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .btn-read-more {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn-read-more:hover {
          background: #2563eb;
          color: white;
        }

        .btn-read-more svg {
          transition: transform 0.3s ease;
        }

        .btn-read-more:hover svg {
          transform: translateX(4px);
        }

        /* Services Section */
        .services-section {
          padding: 80px 0;
          background: #ffffff;
        }

        .services-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
        }

        .services-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .services-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
        }

        .services-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 32px;
          margin-top: 64px;
        }

        .service-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          width: calc(33.333% - 22px);
          max-width: 380px;
          min-width: 300px;
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        .service-card:hover .service-title,
        .service-card:hover .service-text {
          color: white;
        }

        .service-card:hover .service-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .service-icon {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: white;
          transition: transform 0.3s ease;
        }

        .service-card:hover .service-icon {
          transform: scale(1.1);
        }

        .service-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .service-text {
          font-size: 0.9375rem;
          color: #495057;
          line-height: 1.6;
        }

        /* Quality Section */
        .quality-section {
          padding: 80px 0;
          background: linear-gradient(to bottom, #ffffff, #ffffff);
        }

        .quality-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
        }

        .quality-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .quality-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
        }

        .quality-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 64px;
          text-align: justify
        }

        .quality-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .quality-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        .quality-image-container {
          height: 320px;
          overflow: hidden;
        }

        .quality-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .quality-card:hover .quality-image {
          transform: scale(1.1);
        }

        .quality-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .quality-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 15px;
          min-height: 70px
        }

        .quality-description {
          font-size: 0.9375rem;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 16px;
          flex: 1;
        }

        .btn-quality-read-more {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s ease;
          margin-top: auto;
          align-self: flex-start;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn-quality-read-more:hover {
          background: #2563eb;
          color: white;
        }

        .btn-quality-read-more svg {
          transition: transform 0.3s ease;
        }

        .btn-quality-read-more:hover svg {
          transform: translateX(4px);
        }

       /* Sampling Section */
      .sampling-section {
        padding: 80px 0;
        background: #f8f9fa;
      }

      .sampling-intro-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 48px;
        margin-bottom: 48px;
        align-items: start;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 32px;
      }

      .sampling-intro-grid .section-title {
        margin-top: 0;
        font-size: 2.5rem;
        line-height: 1.2;
      }

      .sampling-intro-grid .section-intro {
        font-size: 1rem;
        margin-top: 0;
      }

      .sampling-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        margin-top: 64px;
        text-align: justify;
      }

      .sampling-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
      }

      .sampling-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
      }

      .sampling-image-container {
        height: 320px;
        overflow: hidden;
      }

      .sampling-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .sampling-card:hover .sampling-image {
        transform: scale(1.1);
      }

      .sampling-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      .sampling-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 15px;
        min-height: 70px;
      }

      .sampling-description {
        font-size: 0.9375rem;
        color: #495057;
        line-height: 1.6;
        margin-bottom: 16px;
        flex: 1;
      }
      .btn-sampling-read-more {
        background: white;
        color: #2563eb;
        border: 2px solid #2563eb;
        padding: 6px 16px;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.75rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.3s ease;
        margin-top: auto;
        align-self: flex-start;
        white-space: nowrap;
        text-decoration: none;
      }

      .btn-sampling-read-more:hover {
        background: #2563eb;
        color: white;
      }

      .btn-sampling-read-more svg {
        transition: transform 0.3s ease;
      }

      .btn-sampling-read-more:hover svg {
        transform: translateX(4px);
      }


        /* PLTP Works Section */
        .pltp-works-section {
          padding: 80px 0;
          background: #f8f9fa;
        }

        .pltp-works-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
          margin-bottom: 48px;
        }

        .pltp-works-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .pltp-works-image-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-height: 250px;
          margin-top: 16px;
        }

        .pltp-works-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .pltp-works-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
          margin-bottom: 24px;
          text-align: justify;
        }

        .btn-pltp-guide {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-top: 16px;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-pltp-guide:hover {
          background: #2563eb;
          color: white;
        }

        .btn-pltp-guide svg {
          transition: transform 0.3s ease;
        }

        .btn-pltp-guide:hover svg {
          transform: translateX(4px);
        }

        .pltp-work-image-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        .pltp-work-image-card:hover .pltp-work-image {
          transform: scale(1.1);
        }

        /* AI Monitoring Section */
        .ai-section {
          padding: 80px 0;
          background: #ffffff;
        }

        .ai-intro-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
          align-items: start;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 32px;
        }

        .ai-intro-grid .section-title {
          margin-top: 0;
          font-size: 2.5rem;
          line-height: 1.2;
        }

        .ai-intro-grid .section-intro {
          font-size: 1rem;
          margin-top: 0;
        }

        .ai-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 64px;
        }

        .ai-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .ai-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
        }

        .ai-image-container {
          height: 320px;
          overflow: hidden;
        }

        .ai-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .ai-card:hover .ai-image {
          transform: scale(1.1);
        }

        .ai-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          text-align: justify
        }

        .ai-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .ai-description {
          font-size: 0.9375rem;
          color: #495057;
          line-height: 1.6;
          margin-bottom: 16px;
          flex: 1;
        }

        .btn-ai-read-more {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.3s ease;
          margin-top: auto;
          align-self: flex-start;
          white-space: nowrap;
          text-decoration: none;
        }

        .btn-ai-read-more:hover {
          background: #2563eb;
          color: white;
        }

        .btn-ai-read-more svg {
          transition: transform 0.3s ease;
        }

        .btn-ai-read-more:hover svg {
          transform: translateX(4px);
        }

        /* Research Team Section */
        .team-section {
          padding: 80px 0;
          background: #f8f9fa;
        }

        .team-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .team-badge {
          display: inline-block;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .team-header .section-title {
          max-width: 900px;
          margin: 0 auto;
          line-height: 1.3;
        }

        .team-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .team-group {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .team-group-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 24px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .team-group-logo-container {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .team-group-logo {
          display: block;
          width: auto;
          object-fit: contain;
        }

        /* Per-logo size — adjust each height independently */
        .team-group-logo-pertamina {
          height: 64px;
        }

        .team-group-logo-unpad {
          height: 75px;
        }

        .team-group-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a2642;
          margin: 0;
        }

        .team-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .team-member {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }

        .team-member:hover {
          background: #f8f9fa;
        }

        .team-avatar {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #1a2642;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .team-member-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-width: 0;
        }

        .team-member-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.4;
        }

        .team-role {
          display: inline-block;
          background: #e9ecef;
          color: #495057;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.5;
        }

        .team-role-highlight {
          background: rgba(37, 99, 235, 0.1);
          color: #1e40af;
          font-weight: 600;
        }

        /* Collaboration Section */
        .collaboration-section {
          padding: 80px 0;
          background: #1a2642;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .collaboration-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></svg>');
          opacity: 0.3;
        }

        .collaboration-header {
          text-align: center;
          margin-bottom: 48px;
          position: relative;
          z-index: 1;
        }

        .collaboration-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .collaboration-header .section-title {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 0;
        }

        .collaboration-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .collaboration-text .section-intro {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1.8;
          margin: 0;
          text-align: justify;
        }

        .collaboration-map {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .map-image {
          width: 100%;
          max-width: 500px;
          height: auto;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
        }

        .partner-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          min-height: 200px;
        }

        .partner-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          background: white;
        }

        .partner-logo-container {
          width: 120px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .partner-logo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .partner-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a1a;
          text-align: center;
          margin: 0;
        }

        /* Footer */
        .footer {
          background: #0f1729;
          color: white;
          padding: 48px 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-bottom: 32px;
        }

        .footer-logos {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .footer-text {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          text-align: justify
        }

        .footer-heading {
          font-weight: 700;
          margin-bottom: 16px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
        }

        .footer-links li {
          margin-bottom: 8px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 32px;
          text-align: center;
        }

        .footer-bottom p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-content-wrapper {
            padding-left: 0;
            max-width: 100%;
            grid-template-columns: 1fr;
          }
            .pltp-works-content-grid {
            grid-template-columns: 1fr;
            gap: 32px;

          .mission-grid {
            grid-template-columns: 1fr;
          }

          .services-intro-grid,
          .quality-intro-grid,
          .pltp-works-intro-grid,
          .ai-intro-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .services-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .service-card {
            width: 100%;
            max-width: 100%;
          }

          .quality-cards,
          .pltp-works-images{
          width: 100%;
          height: auto;
          display: block;}
          .ai-cards {
            grid-template-columns: 1fr;
          }

          .collaboration-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .partners-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 16px;
          }

          .nav {
            flex-wrap: wrap;
            gap: 16px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            width: 100%;
            max-width: 100%;
          }

          .collaboration-header .section-title {
            font-size: 2rem;
          }

          .team-section {
            padding: 56px 0;
          }

          .team-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .team-group {
            padding: 20px 16px;
          }

          .team-member {
            padding: 10px 8px;
          }

          .partners-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .partner-card {
            padding: 24px 16px;
            min-height: 160px;
          }

          .partner-logo-container {
            width: 100px;
            height: 60px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .partners-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
