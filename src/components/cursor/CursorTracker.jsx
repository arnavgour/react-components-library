import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CursorTracker - Premium animated cursor with smooth movement and trails
 * 
 * Features:
 * - Ultra-smooth cursor following with lerp animation
 * - Motion trail particles
 * - Hover effects on interactive elements
 * - Click animation
 */
const CursorTracker = () => {
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);
    const trail1Ref = useRef(null);
    const trail2Ref = useRef(null);
    const trail3Ref = useRef(null);
    const requestRef = useRef(null);

    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [hoverRect, setHoverRect] = useState(null);

    // Refs for animation loop access
    const hoverRectRef = useRef(null);
    const isHoveringRef = useRef(false);

    // Keep refs in sync with state
    useEffect(() => {
        hoverRectRef.current = hoverRect;
        isHoveringRef.current = isHovering;
    }, [hoverRect, isHovering]);

    // Mouse position with refs for performance
    const mousePos = useRef({ x: -100, y: -100 });
    const cursorPos = useRef({ x: -100, y: -100 });
    const dotPos = useRef({ x: -100, y: -100 });
    const trail1Pos = useRef({ x: -100, y: -100 });
    const trail2Pos = useRef({ x: -100, y: -100 });
    const trail3Pos = useRef({ x: -100, y: -100 });

    // Check if device has a mouse
    const [hasPointer, setHasPointer] = useState(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(pointer: fine)');
        setHasPointer(mediaQuery.matches);

        const handleChange = (e) => setHasPointer(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Smooth lerp function
    const lerp = (start, end, factor) => start + (end - start) * factor;

    // Animation loop for ultra-smooth cursor movement
    const animate = useCallback(() => {
        // Smooth interpolation factors
        const ringSpeed = 0.12;
        const dotSpeed = 0.35;
        const trail1Speed = 0.15;
        const trail2Speed = 0.12;
        const trail3Speed = 0.09;

        // If hovering, lock cursor ring to button center; otherwise follow mouse
        const targetX = isHoveringRef.current && hoverRectRef.current
            ? hoverRectRef.current.x
            : mousePos.current.x;
        const targetY = isHoveringRef.current && hoverRectRef.current
            ? hoverRectRef.current.y
            : mousePos.current.y;

        // Lerp cursor ring position (to button center when hovering)
        cursorPos.current.x = lerp(cursorPos.current.x, targetX, ringSpeed);
        cursorPos.current.y = lerp(cursorPos.current.y, targetY, ringSpeed);

        // Lerp dot position (always follows mouse)
        dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, dotSpeed);
        dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, dotSpeed);

        // Lerp trail positions - ALWAYS follow the mouse/dot, not the ring
        trail1Pos.current.x = lerp(trail1Pos.current.x, dotPos.current.x, trail1Speed);
        trail1Pos.current.y = lerp(trail1Pos.current.y, dotPos.current.y, trail1Speed);

        trail2Pos.current.x = lerp(trail2Pos.current.x, trail1Pos.current.x, trail2Speed);
        trail2Pos.current.y = lerp(trail2Pos.current.y, trail1Pos.current.y, trail2Speed);

        trail3Pos.current.x = lerp(trail3Pos.current.x, trail2Pos.current.x, trail3Speed);
        trail3Pos.current.y = lerp(trail3Pos.current.y, trail2Pos.current.y, trail3Speed);

        // Apply transforms
        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
        }

        if (cursorDotRef.current) {
            cursorDotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
        }

        // Apply trail transforms
        if (trail1Ref.current) {
            trail1Ref.current.style.transform = `translate3d(${trail1Pos.current.x}px, ${trail1Pos.current.y}px, 0)`;
        }
        if (trail2Ref.current) {
            trail2Ref.current.style.transform = `translate3d(${trail2Pos.current.x}px, ${trail2Pos.current.y}px, 0)`;
        }
        if (trail3Ref.current) {
            trail3Ref.current.style.transform = `translate3d(${trail3Pos.current.x}px, ${trail3Pos.current.y}px, 0)`;
        }

        requestRef.current = requestAnimationFrame(animate);
    }, []);

    // Start animation loop
    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [animate]);

    // Mouse move handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible]);

    // Track current hovered element for click detection
    const currentHoveredElement = useRef(null);

    // Click handlers
    useEffect(() => {
        const handleMouseDown = (e) => {
            setIsClicking(true);
            // Store the clicked element
            const interactiveSelectors = 'a, button, [role="button"], [data-cursor-hover]';
            currentHoveredElement.current = e.target.closest(interactiveSelectors);
        };

        const handleMouseUp = () => {
            setIsClicking(false);
            // Only reset if the element is no longer in the DOM (navigation occurred)
            setTimeout(() => {
                if (currentHoveredElement.current && !document.contains(currentHoveredElement.current)) {
                    setIsHovering(false);
                    setHoverRect(null);
                }
                currentHoveredElement.current = null;
            }, 100);
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Hover detection with element size tracking
    useEffect(() => {
        const interactiveSelectors = 'a, button, [role="button"], [data-cursor-hover]';
        let currentTarget = null;

        const handleMouseEnterElement = (e) => {
            const target = e.target.closest(interactiveSelectors);
            if (target && target !== currentTarget) {
                currentTarget = target;
                setIsHovering(true);
                const rect = target.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(target);
                const buttonRadius = computedStyle.borderRadius || '8px';

                // Equal padding on all sides (4px each side = 8px total added to each dimension)
                const padding = 4;

                setHoverRect({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    width: rect.width + (padding * 2),
                    height: rect.height + (padding * 2),
                    borderRadius: buttonRadius,
                });

                // Add mouseleave listener to the specific element
                const handleLeave = () => {
                    setIsHovering(false);
                    setHoverRect(null);
                    currentTarget = null;
                    target.removeEventListener('mouseleave', handleLeave);
                };
                target.addEventListener('mouseleave', handleLeave);
            }
        };

        document.addEventListener('mouseover', handleMouseEnterElement, { passive: true });

        return () => {
            document.removeEventListener('mouseover', handleMouseEnterElement);
        };
    }, []);

    if (!hasPointer) return null;

    // Calculate cursor size and position
    const getCursorStyles = () => {
        if (isHovering && hoverRect) {
            return {
                width: `${hoverRect.width}px`,
                height: `${hoverRect.height}px`,
                marginLeft: `-${hoverRect.width / 2}px`,
                marginTop: `-${hoverRect.height / 2}px`,
                borderRadius: hoverRect.borderRadius || '12px',
            };
        }
        if (isClicking) {
            return {
                width: '28px',
                height: '28px',
                marginLeft: '-14px',
                marginTop: '-14px',
                borderRadius: '50%',
            };
        }
        return {
            width: '36px',
            height: '36px',
            marginLeft: '-18px',
            marginTop: '-18px',
            borderRadius: '50%',
        };
    };

    const cursorStyles = getCursorStyles();

    return (
        <>
            {/* Hide default cursor */}
            <style>{`
        * { cursor: none !important; }
      `}</style>

            {/* Trail particles - farthest (lightest) to closest (darker) */}
            <div
                ref={trail3Ref}
                className="fixed top-0 left-0 pointer-events-none z-[9995] will-change-transform rounded-full"
                style={{
                    width: '16px',
                    height: '16px',
                    marginLeft: '-8px',
                    marginTop: '-8px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />
            <div
                ref={trail2Ref}
                className="fixed top-0 left-0 pointer-events-none z-[9996] will-change-transform rounded-full"
                style={{
                    width: '12px',
                    height: '12px',
                    marginLeft: '-6px',
                    marginTop: '-6px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />
            <div
                ref={trail1Ref}
                className="fixed top-0 left-0 pointer-events-none z-[9997] will-change-transform rounded-full"
                style={{
                    width: '10px',
                    height: '10px',
                    marginLeft: '-5px',
                    marginTop: '-5px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Main cursor ring - snaps to button size with spring effect */}
            {/* Outer div handles positioning + size, inner div handles wobble + styling */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
                style={{
                    width: cursorStyles.width,
                    height: cursorStyles.height,
                    marginLeft: cursorStyles.marginLeft,
                    marginTop: cursorStyles.marginTop,
                    // Smooth shape morphing with spring effect
                    transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), margin 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                <div
                    className="w-full h-full"
                    style={{
                        borderRadius: cursorStyles.borderRadius,
                        border: `2px solid ${isHovering ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.6)'}`,
                        backgroundColor: isHovering ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                        boxShadow: isHovering
                            ? '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)'
                            : '0 0 10px rgba(139, 92, 246, 0.2)',
                        opacity: isVisible ? 1 : 0,
                        // Smooth border-radius morphing (circle to button shape)
                        transition: 'border-radius 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                    }}
                />
            </div>

            {/* Center dot */}
            <div
                ref={cursorDotRef}
                className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
                style={{
                    width: isClicking ? '12px' : isHovering ? '6px' : '8px',
                    height: isClicking ? '12px' : isHovering ? '6px' : '8px',
                    marginLeft: isClicking ? '-6px' : isHovering ? '-3px' : '-4px',
                    marginTop: isClicking ? '-6px' : isHovering ? '-3px' : '-4px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 92, 246, 1)',
                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.8), 0 0 16px rgba(139, 92, 246, 0.4)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'width 0.15s ease, height 0.15s ease, margin 0.15s ease, opacity 0.3s ease',
                }}
            />
        </>
    );
};

export default CursorTracker;

