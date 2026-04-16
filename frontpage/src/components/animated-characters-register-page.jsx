"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import axios from 'axios';

// 配置 axios 基础路径，指向你的 Spring Boot 后端
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

// --- 这里保留你原有的 Pupil 和 EyeBall 组件代码，完全不用动 ---
const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY }) => {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const pupilRef = useRef(null);
    useEffect(() => {
        const handleMouseMove = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
    const calculatePupilPosition = () => {
        if (!pupilRef.current) return { x: 0, y: 0 };
        if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
        const pupil = pupilRef.current.getBoundingClientRect();
        const deltaX = mouseX - (pupil.left + pupil.width / 2);
        const deltaY = mouseY - (pupil.top + pupil.height / 2);
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };
    const pupilPosition = calculatePupilPosition();
    return (
        <div ref={pupilRef} className="rounded-full"
             style={{ width: `${size}px`, height: `${size}px`, backgroundColor: pupilColor, transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`, transition: 'transform 0.1s ease-out' }} />
    );
};

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black", isBlinking = false, forceLookX, forceLookY }) => {
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const eyeRef = useRef(null);
    useEffect(() => {
        const handleMouseMove = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
    const calculatePupilPosition = () => {
        if (!eyeRef.current) return { x: 0, y: 0 };
        if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
        const eye = eyeRef.current.getBoundingClientRect();
        const deltaX = mouseX - (eye.left + eye.width / 2);
        const deltaY = mouseY - (eye.top + eye.height / 2);
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };
    const pupilPosition = calculatePupilPosition();
    return (
        <div ref={eyeRef} className="rounded-full flex items-center justify-center transition-all duration-150"
             style={{ width: `${size}px`, height: isBlinking ? '2px' : `${size}px`, backgroundColor: eyeColor, overflow: 'hidden' }}>
            {!isBlinking && (
                <div className="rounded-full" style={{ width: `${pupilSize}px`, height: `${pupilSize}px`, backgroundColor: pupilColor, transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`, transition: 'transform 0.1s ease-out' }} />
            )}
        </div>
    );
};
// --- 组件代码结束 ---

function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // 记录确认密码
    const [tags, setTags] = useState(""); // 记录画像标签
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 动画状态
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);
    const purpleRef = useRef(null);
    const blackRef = useRef(null);
    const yellowRef = useRef(null);
    const orangeRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => { setMouseX(e.clientX); setMouseY(e.clientY); };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const scheduleBlink = () => {
            return setTimeout(() => {
                setIsPurpleBlinking(true);
                setTimeout(() => { setIsPurpleBlinking(false); scheduleBlink(); }, 150);
            }, Math.random() * 4000 + 3000);
        };
        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const scheduleBlink = () => {
            return setTimeout(() => {
                setIsBlackBlinking(true);
                setTimeout(() => { setIsBlackBlinking(false); scheduleBlink(); }, 150);
            }, Math.random() * 4000 + 3000);
        };
        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
            return () => clearTimeout(timer);
        } else {
            setIsLookingAtEachOther(false);
        }
    }, [isTyping]);

    useEffect(() => {
        if (password.length > 0 && showPassword) {
            const schedulePeek = () => {
                return setTimeout(() => {
                    setIsPurplePeeking(true);
                    setTimeout(() => setIsPurplePeeking(false), 800);
                }, Math.random() * 3000 + 2000);
            };
            const firstPeek = schedulePeek();
            return () => clearTimeout(firstPeek);
        } else {
            setIsPurplePeeking(false);
        }
    }, [password, showPassword, isPurplePeeking]);

    const calculatePosition = (ref) => {
        if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
        const rect = ref.current.getBoundingClientRect();
        const deltaX = mouseX - (rect.left + rect.width / 2);
        const deltaY = mouseY - (rect.top + rect.height / 3);
        return {
            faceX: Math.max(-15, Math.min(15, deltaX / 20)),
            faceY: Math.max(-10, Math.min(10, deltaY / 30)),
            bodySkew: Math.max(-6, Math.min(6, -deltaX / 120))
        };
    };

    const purplePos = calculatePosition(purpleRef);
    const blackPos = calculatePosition(blackRef);
    const yellowPos = calculatePosition(yellowRef);
    const orangePos = calculatePosition(orangeRef);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("两次输入的密码不一致！");
            return;
        }

        setIsLoading(true);

        try {
            // 对接 Spring Boot 的注册接口
            const response = await axios.post('/api/auth/register', {
                email: email, // 传给后端的 key 必须叫 email
                nickname: nickname,
                password: password,
                tags: tags
            });

            if (response.data.code === 200 || response.data.code === 0) {
                alert("注册成功！请前往登录");
                // 跳转回登录页
                window.location.href = '/login';
            } else {
                setError(response.data.desc || "注册失败，该账号可能已存在");
            }
        } catch (error) {
            console.error("注册异常", error);
            setError("网络错误，请确保后端服务器已启动");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* 左侧动画区域：与 Login 页面保持完全一致 */}
            <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground">
                <div className="relative z-20">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>XeChat</span>
                    </div>
                </div>

                <div className="relative z-20 flex items-end justify-center h-[500px]">
                    {/* 这里是可爱的动画角色容器 */}
                    <div className="relative" style={{ width: '550px', height: '400px' }}>
                        {/* 紫色角色 */}
                        <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
                             style={{ left: '70px', width: '180px', height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px', backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1, transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : (isTyping || (password.length > 0 && !showPassword)) ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` : `skewX(${purplePos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                            <div className="absolute flex gap-8 transition-all duration-700 ease-in-out" style={{ left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`, top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px` }}>
                                <EyeBall size={18} pupilSize={7} maxDistance={5} pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                                <EyeBall size={18} pupilSize={7} maxDistance={5} pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                            </div>
                        </div>

                        {/* 黑色角色 */}
                        <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
                             style={{ left: '240px', width: '120px', height: '310px', backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2, transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : isLookingAtEachOther ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)` : (isTyping || (password.length > 0 && !showPassword)) ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` : `skewX(${blackPos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                            <div className="absolute flex gap-6 transition-all duration-700 ease-in-out" style={{ left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`, top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px` }}>
                                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={isBlackBlinking} forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined} />
                                <EyeBall size={16} pupilSize={6} maxDistance={4} pupilColor="#2D2D2D" isBlinking={isBlackBlinking} forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined} />
                            </div>
                        </div>

                        {/* 橙色角色 */}
                        <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{ left: '0px', width: '240px', height: '200px', zIndex: 3, backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0', transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                            <div className="absolute flex gap-8 transition-all duration-200 ease-out" style={{ left: (password.length > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`, top: (password.length > 0 && showPassword) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px` }}>
                                <Pupil size={12} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                        </div>

                        {/* 黄色角色 */}
                        <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out" style={{ left: '310px', width: '140px', height: '230px', backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4, transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                            <div className="absolute flex gap-6 transition-all duration-200 ease-out" style={{ left: (password.length > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`, top: (password.length > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px` }}>
                                <Pupil size={12} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                            <div className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out" style={{ left: (password.length > 0 && showPassword) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`, top: (password.length > 0 && showPassword) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px` }} />
                        </div>
                    </div>
                </div>

                <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
                    <span>XeChat Platform</span>
                </div>
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
            </div>

            {/* 右侧注册表单区域 */}
            <div className="flex items-center justify-center p-8 bg-background overflow-y-auto">
                <div className="w-full max-w-[420px] py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
                        <p className="text-muted-foreground text-sm">Join XeChat and start connecting</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 账号输入 */}
                        {/* 邮箱输入 */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email (邮箱账号)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                required
                                className="h-11 bg-background border-border/60 focus:border-primary" />
                        </div>

                        {/* 昵称输入 */}
                        <div className="space-y-2">
                            <Label htmlFor="nickname" className="text-sm font-medium">Nickname (聊天昵称)</Label>
                            <Input
                                id="nickname"
                                type="text"
                                placeholder="How should we call you?"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                required
                                className="h-11 bg-background border-border/60 focus:border-primary" />
                        </div>

                        {/* 密码输入 */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password (密码)</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsTyping(true)}
                                    onBlur={() => setIsTyping(false)}
                                    required
                                    className="h-11 pr-10 bg-background border-border/60 focus:border-primary" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        {/* 确认密码输入框 */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password (确认密码)</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"} // 跟随密码显示/隐藏状态
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                required
                                className="h-11 bg-background border-border/60 focus:border-primary" />
                        </div>

                        {/* 画像标签输入框 - 对应你精准 SQL 里的 tags 字段 */}
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-sm font-medium">User Tags (画像标签)</Label>
                            <Input
                                id="tags"
                                type="text"
                                placeholder="例如: Java, 算法, 聊大校友"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                className="h-11 bg-background border-border/60 focus:border-primary" />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium mt-2"
                            disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <a href="/login" className="text-primary font-medium hover:underline">
                            Log in
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { RegisterPage as AnimatedCharactersRegisterPage };