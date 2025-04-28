import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
        
    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <header className="flex justify-between items-center bg-gray-800 text-white h-20 px-4">
            <h1 className="text-xl">勞工檢測平台</h1>
            <button 
                onClick={handleLogin}
                className="text-center w-20 bg-blue-500 hover:bg-blue-600 rounded-lg items-center h-10 mr-4">
                登入
            </button>
        </header>
    );
}

export default Header;