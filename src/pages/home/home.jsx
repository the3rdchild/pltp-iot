
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const styles = `
    body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(to bottom, #7a8195, #b1b6c5);
        color: #0b2144;
    }
    
    header {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        background-color: white;
        box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    }
    
    header img.logo {
        height: 24px;
        margin-right: 10px;
    }
    
    header h1 {
        font-size: 18px;
        font-weight: 600;
        color: #0b2144;
        margin: 0;
    }
    
    .container {
        max-width: 960px;
        margin: 20px auto;
        padding: 0 20px;
    }
    
    h2.title {
        text-align: center;
        font-weight: 800;
        font-size: 24px;
        margin-bottom: 5px;
        color: #0b2144;
    }
    
    p.subtitle {
        text-align: center;
        color: #f18e00;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 30px;
        font-size: 14px;
    }
    
    .cards {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .card {
        background: white;
        border-radius: 15px;
        width: 300px;
        padding: 16px;
        box-shadow: 0 6px 12px rgb(0 0 0 / 0.1);
        display: flex;
        flex-direction: column;
    }
    
    .card img {
        width: 100%;
        border-radius: 15px;
        object-fit: cover;
        height: 160px;
        margin-bottom: 12px;
    }
    
    .card h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: bold;
        color: #0b2144;
    }
    
    .progress-bar-bg {
        background-color: #c7d6dd;
        height: 4px;
        border-radius: 2px;
        margin-bottom: 10px;
    }
    
    .progress-bar-fill {
        background: linear-gradient(to right, #0b2144, #033772);
        height: 4px;
        border-radius: 2px;
        width: 98.23%;
    }
    
    .quality-percentage {
        font-weight: 400;
        font-size: 14px;
        color: #0b2144;
        margin-bottom: 16px;
    }
    
    .stats {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 20px;
    }
    
    .stat-group {
        text-align: center;
    }
    
    .stat-label {
        color: #5a5a5a;
        font-weight: 400;
        margin-bottom: 4px;
    }
    
    .stat-value {
        font-weight: 700;
        color: #007fa3;
    }
    
    .btn-dashboard {
        background: linear-gradient(to right, #0b2144, #033772);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 10px 0;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.3s ease;
        width: 100%;
        text-decoration: none;
        text-align: center;
    }
    
    .btn-dashboard:hover {
        background: linear-gradient(to right, #021f3d, #021f3dcc);
    }
    
    @media (max-width: 650px) {
        .cards {
            flex-direction: column;
            align-items: center;
        }
        .card {
            width: 90%;
            margin-bottom: 20px;
        }
    }
    `;

    return (
        <React.Fragment>
            <style>{styles}</style>
            <header>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Pertamina_logo.svg" alt="Pertamina Logo" className="logo" />
                <h1>Pertasmart</h1>
            </header>

            <div className="container">
                <h2 className="title">STEAM MONITORING ANALISIS REAL TIME (SMART)</h2>
                <p className="subtitle">kerjasama Pertamina x Universitas Padjadjaran</p>
                <div className="cards">
                    <div className="card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/PLTP_Kamojang_Unit_5.jpg" alt="PLTP Kamojang Unit 5" />
                        <h3>PLTP Kamojang Unit 5</h3>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill"></div>
                        </div>
                        <div className="quality-percentage">Steam Quality 98.23%</div>
                        <div className="stats">
                            <div className="stat-group">
                                <div className="stat-label">Temp</div>
                                <div className="stat-value">165.2°C</div>
                            </div>
                            <div className="stat-group">
                                <div className="stat-label">Pressure</div>
                                <div className="stat-value">5.87barg</div>
                            </div>
                            <div className="stat-group">
                                <div className="stat-label">Power</div>
                                <div className="stat-value">32.46MW</div>
                            </div>
                        </div>
                        <Link to="/dashboard" className="btn-dashboard">Dashboard</Link>
                    </div>

                    <div className="card">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/PLTP_Ulubelu.jpg" alt="PLTP Ulubelu" />
                        <h3>PLTP Ulubelu</h3>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: '97.5%' }}></div>
                        </div>
                        <div className="quality-percentage">Steam Quality 97.5%</div>
                        <div className="stats">
                            <div className="stat-group">
                                <div className="stat-label">Temp</div>
                                <div className="stat-value">160.1°C</div>
                            </div>
                            <div className="stat-group">
                                <div className="stat-label">Pressure</div>
                                <div className="stat-value">5.52barg</div>
                            </div>
                            <div className="stat-group">
                                <div className="stat-label">Power</div>
                                <div className="stat-value">55.0MW</div>
                            </div>
                        </div>
                        <Link to="/dashboard" className="btn-dashboard">Dashboard</Link>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default HomePage;
