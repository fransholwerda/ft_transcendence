import React from 'react';
import './MainHeader.css';
import mainHeaderImage from './mainheader.png';

const MainHeader: React.FC = () => {
	return (
		<div className="main-header">
			<div className="header-content">
				<div className="header-logo">
					<img src={mainHeaderImage} alt="logo" />
				</div>
				<div className="header-title">
					<h1>FT Transcendence</h1>
				</div>
			</div>
			<div className="header-profile">
				<button className="header-profile-button">Profile</button>
			</div>
			<div className="header-logout">
				<button className="header-logout-button">Logout</button>
			</div>
		</div>
	);
}

export default MainHeader;
