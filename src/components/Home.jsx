import React from 'react';

function Home({ onStartGame }) {
  // 모눈종이(좌표평면) 느낌의 배경 패턴
  const gridBackground = {
    backgroundColor: '#e9f5e9', // 파스텔 연초록
    backgroundImage: `
      linear-gradient(#dceddc 1px, transparent 1px),
      linear-gradient(90deg, #dceddc 1px, transparent 1px)
    `,
    backgroundSize: '30px 30px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Malgun Gothic", sans-serif',
    padding: '20px'
  };

  // 나무판 느낌의 중앙 컨테이너
  const boardContainer = {
    backgroundColor: '#d2b48c',
    padding: '15px',
    borderRadius: '20px',
    border: '4px solid #8b5a2b',
    boxShadow: '0 10px 20px rgba(93, 64, 55, 0.4)',
    textAlign: 'center',
    maxWidth: '450px',
    width: '100%'
  };

  // 안쪽 종이 느낌의 영역
  const innerContainer = {
    backgroundColor: '#faf6f0',
    padding: '40px 30px',
    borderRadius: '12px',
    border: '2px solid #a1887f',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid',
    borderRadius: '10px',
    transition: 'transform 0.1s, boxShadow 0.1s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    color: '#4e342e'
  };

  return (
    <div style={gridBackground}>
      <div style={boardContainer}>
        <div style={innerContainer}>
          <h1 style={{ color: '#3e5c3e', fontSize: '2.8rem', margin: '0 0 10px 0', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            좌표픽셀
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#795548', margin: '0 0 35px 0', fontWeight: 'bold' }}>
            함께 즐기는 3목 좌표 전략 게임
          </p>
          
          <h3 style={{ color: '#5d4037', fontSize: '1.3rem', marginBottom: '20px', borderBottom: '2px dashed #d7ccc8', paddingBottom: '10px' }}>
            플레이 인원 선택
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              onClick={() => onStartGame('AI')} 
              style={{ ...buttonStyle, backgroundColor: '#E8F5E9', borderColor: '#81C784', color: '#2E7D32' }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🤖 AI 봇과 혼자 연습
            </button>
            
            <button 
              onClick={() => onStartGame(2)} 
              style={{ ...buttonStyle, backgroundColor: '#C8E6C9', borderColor: '#66BB6A' }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              👥 2인 플레이
            </button>
            
            <button 
              onClick={() => onStartGame(3)} 
              style={{ ...buttonStyle, backgroundColor: '#BBDEFB', borderColor: '#64B5F6' }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              👤👤👤 3인 플레이
            </button>
            
            <button 
              onClick={() => onStartGame(4)} 
              style={{ ...buttonStyle, backgroundColor: '#FFECB3', borderColor: '#FFD54F' }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              👨‍👩‍👧‍👦 4인 플레이
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
