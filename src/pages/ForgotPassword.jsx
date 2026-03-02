import { useState, useRef } from 'react';
import '../css/ForgotPassword.css';

export default function ForgotPassword({ onVerify }) {
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    const handleChange = (val, index) => {
        if (isNaN(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);
        if (val && index < 3) inputRefs.current[index + 1].focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="otp-page">
            <h1 className="top-logo">MRC</h1>
            <div className="otp-content">
                <h3>Enter Otp</h3>
                <div className="otp-input-group">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={e => handleChange(e.target.value, i)}
                            onKeyDown={e => handleKeyDown(e, i)}
                            className="otp-box"
                        />
                    ))}
                </div>
                <button className="btn-primary-wide" onClick={onVerify}>Enter</button>
                <div className="otp-info">
                    <span>User1@gmail.com</span>
                    <a href="#" className="blue-link">Change Mail</a>
                </div>
            </div>
        </div>
    );
}
