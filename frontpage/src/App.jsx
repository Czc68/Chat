import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 1. 检查这里的路径！如果你文件在 src/components 下，就改成 './components/ChatPage'
import { AnimatedCharactersLoginPage } from './components/animated-characters-login-page';
import { AnimatedCharactersRegisterPage } from './components/animated-characters-register-page';
import ChatPage from './components/ChatPage'; // 确保路径指向你新建的组件文件

function App() {
    return (
        <Router>
            <Routes>
                {/* 默认跳转到登录 */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<AnimatedCharactersLoginPage />} />
                <Route path="/register" element={<AnimatedCharactersRegisterPage />} />

                {/* 👇👇👇 必须加上这一行，否则无法访问 /chat 👇👇👇 */}
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </Router>
    );
}

export default App;