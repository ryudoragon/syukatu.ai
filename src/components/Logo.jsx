import React from 'react'

export default function Logo({ className = "", size = "medium" }) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 120 40" className="w-full h-full">
        {/* 法問研ロゴのSVGパス */}
        <g fill="currentColor">
          {/* 法の字 */}
          <g>
            {/* さんずい */}
            <path d="M5 8 L5 15 L7 15 L7 8 L5 8 Z" />
            <path d="M3 8 L3 15 L5 15 L5 8 L3 8 Z" />
            <path d="M3 8 L1 8 L1 6 L3 6 Z" />
            
            {/* 去 */}
            <path d="M12 8 L12 15 L14 15 L14 8 L12 8 Z" />
            <path d="M10 8 L10 10 L12 10 L12 8 L10 8 Z" />
            <path d="M10 10 L10 12 L14 12 L14 10 L10 10 Z" />
            <path d="M10 12 L10 15 L14 15 L14 12 L10 12 Z" />
            <path d="M12 13 L12 15 L16 15 L16 13 L12 13 Z" />
          </g>
          
          {/* 問の字 */}
          <g transform="translate(20, 0)">
            {/* 門 */}
            <path d="M5 8 L5 15 L7 15 L7 8 L5 8 Z" />
            <path d="M7 8 L7 15 L9 15 L9 8 L7 8 Z" />
            <path d="M5 8 L3 8 L3 6 L5 6 Z" />
            <path d="M7 8 L9 8 L9 6 L7 6 Z" />
            
            {/* 口 */}
            <path d="M6 10 L6 13 L8 13 L8 10 L6 10 Z" />
          </g>
          
          {/* 研の字 */}
          <g transform="translate(35, 0)">
            {/* 石 */}
            <path d="M5 8 L5 15 L7 15 L7 8 L5 8 Z" />
            <path d="M3 8 L3 10 L5 10 L5 8 L3 8 Z" />
            <path d="M5 9 L5 11 L7 11 L7 9 L5 9 Z" />
            
            {/* 开 */}
            <path d="M12 8 L12 15 L14 15 L14 8 L12 8 Z" />
            <path d="M10 8 L10 10 L12 10 L12 8 L10 8 Z" />
            <path d="M10 10 L10 12 L14 12 L14 10 L10 10 Z" />
            <path d="M10 12 L10 15 L14 15 L14 12 L10 12 Z" />
            <path d="M12 13 L12 15 L16 15 L16 13 L12 13 Z" />
          </g>
        </g>
      </svg>
    </div>
  )
}

// テキストロゴコンポーネント
export function TextLogo({ className = "" }) {
  return (
    <div className={`font-bold text-black dark:text-white ${className}`}>
      <span className="text-3xl">法問研</span>
    </div>
  )
}
