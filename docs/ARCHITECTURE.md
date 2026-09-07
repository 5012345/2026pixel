# 프로젝트 아키텍처

- **src/components**: 교사 화면(`TeacherConsole`), 학생 화면(`StudentView`) 등 사용자 인터페이스 컴포넌트
- **src/engine**: 수학 문제 정답 판정, 게임 턴이나 진행 상태를 변경하는 주요 비즈니스 로직
- **src/store**: Firebase Realtime DB 등과 연동하여 교사-학생 간 실시간으로 공유되는 상태를 관리
- **src/data**: 수학 문제 데이터 등 정적 데이터를 모아두는 곳
- **src/assets**: 이미지, 효과음 등 정적 리소스 파일
