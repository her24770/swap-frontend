"use client";
import { ChevronRight } from "lucide-react"; 
import './PostDetailsButton.css';

interface PostDetailsButtonProps {
  label: string;
  onClick: () => void;
}

export default function PostDetailsButton({ label, onClick }: PostDetailsButtonProps) {
  return (
    <button 
      type="button" 
      className="action-button" 
      onClick={onClick}
    >
      <span className="action-button__text">{label}</span>
      <ChevronRight className="action-button__icon" size={18} />
    </button>
  );
}