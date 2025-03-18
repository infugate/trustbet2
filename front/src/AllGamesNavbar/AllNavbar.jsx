import React from "react";
import styled from "styled-components";
import { FaSignOutAlt } from "react-icons/fa";
import { useProfile } from '../context/ProfileContext';
import { useLocation, useNavigate } from "react-router-dom";

const NavbarContainer = styled.nav`
  margin-top: -7px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0b3c68;
  color: white;
  padding: 14px 0px;
  position: fixed;
  overflow-y: auto;
  z-index: 1000;
  width: 100%;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 21px;
`;

const LogoText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
`;

const WalletIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 21px;
  cursor: pointer;
  transition: transform 0.3s, color 0.3s;

  &:hover {
    transform: scale(1.1); 
    color: #f39c12;
  }
`;

const BalanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BalanceText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
`;

const ExposureText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.amount > 0 ? '#ff5252' : '#4caf50'};
  margin-top: 2px;
  font-weight: ${props => props.amount > 0 ? '500' : '400'};
`;

export default function Navbar() {
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
   
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); 
  };

  return (
    <NavbarContainer>
      <LogoContainer>
        <LogoText>TrustBet247</LogoText>
      </LogoContainer>
      
      <BalanceContainer>
        <BalanceText>
          Balance: ₹{profile.walletBalance}
        </BalanceText>
        <ExposureText amount={profile.exposureBalance}>
          Exposure: ₹{profile.exposureBalance ? profile.exposureBalance.toFixed(2) : '0.00'}
        </ExposureText>
      </BalanceContainer>

      <WalletIcon onClick={handleLogout}>
        <FaSignOutAlt/>
      </WalletIcon>
    </NavbarContainer>
  );
}
