
import React from "react";

interface TeamLogoProps {
  teamName: string;
  className?: string;
}

const getTeamLogo = (team: string) => {
  const logos: { [key: string]: string } = {
    "McLaren": "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png.transform/2col/image.png",
    "Ferrari": "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png.transform/2col/image.png", 
    "Red Bull": "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png.transform/2col/image.png",
    "Mercedes": "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png.transform/2col/image.png",
    "Williams": "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png.transform/2col/image.png",
    "Aston Martin": "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png.transform/2col/image.png",
    "Alpine F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png.transform/2col/image.png",
    "Haas F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png.transform/2col/image.png",
    "RB F1 Team": "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png.transform/2col/image.png",
    "Sauber": "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png.transform/2col/image.png"
  };
  return logos[team] || "";
};

const TeamLogo: React.FC<TeamLogoProps> = ({ teamName, className = "" }) => {
  const logoUrl = getTeamLogo(teamName);
  
  if (!logoUrl) {
    return (
      <div className={`bg-red-900/30 rounded-lg p-2 flex items-center justify-center ${className}`}>
        <span className="text-white text-xs font-medium px-2">{teamName}</span>
      </div>
    );
  }

  return (
    <div className={`bg-red-900/30 rounded-lg p-2 flex items-center justify-center ${className}`}>
      <img 
        src={logoUrl}
        alt={teamName}
        className="w-12 h-8 object-contain"
        style={{
          filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))'
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `<span class="text-white text-xs font-medium px-2">${teamName}</span>`;
        }}
      />
    </div>
  );
};

export default TeamLogo;
