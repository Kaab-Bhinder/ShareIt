"use client";

import React from "react";

interface ProductCardProps {
  id: number;
  title: string;
  description?: string;
  dailyRate: number;
  estimatedPrice: number;
  image?: string;
  status?: "available" | "rented" | "dispute" | "inactive";
  daysLeft?: number;
  onRentClick?: () => void;
  onCardClick?: () => void;
  buttonText?: string;
  buttonDisabled?: boolean;
  badge?: string;
  borrowerName?: string;
  condition?: string;
}

const statusColors: Record<string, { badge: string; text: string }> = {
  available: { badge: "bg-primary-500/20 text-primary-400", text: "Available" },
  rented: { badge: "bg-text-muted/20 text-text-secondary", text: "Rented" },
  dispute: { badge: "bg-warning/20 text-warning", text: "Under Dispute" },
  inactive: { badge: "bg-surface-700/50 text-text-muted", text: "Inactive" },
};

export default function ProductCard({
  id,
  title,
  description,
  dailyRate,
  estimatedPrice,
  image,
  status = "available",
  daysLeft,
  onRentClick,
  onCardClick,
  buttonText = "Rent Now",
  buttonDisabled = false,
  badge,
  borrowerName,
  condition,
}: ProductCardProps) {
  const statusColor = statusColors[status] || statusColors.available;
  const isAvailable = status === "available";

  return (
    <div
      onClick={onCardClick}
      className="group product-card cursor-pointer"
    >
      {/* Image Container */}
      <div className="product-card-image">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-700">
            <span className="text-5xl">📦</span>
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${statusColor.badge}`}>
          {badge || statusColor.text}
        </div>

        {/* Days Left Badge (for borrower) */}
        {daysLeft !== undefined && (
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-primary-500/90 text-black text-xs font-bold rounded-full">
            {daysLeft}d left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-400 transition">
            {title}
          </h3>
          {description && (
            <p className="text-text-secondary text-sm mt-1 line-clamp-2">
              {description}
            </p>
          )}
          {borrowerName && (
            <p className="text-text-muted text-xs mt-1">
              By: {borrowerName}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="divider-primary my-3" />

        {/* Details */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Daily Rate</span>
            <span className="text-primary-400 font-bold text-lg">
              PKR {Number(dailyRate).toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Est. Value</span>
            <span className="text-text-primary font-semibold">
              PKR {Number(estimatedPrice).toFixed(0)}
            </span>
          </div>
          {condition && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Condition</span>
              <span className="text-text-primary font-semibold capitalize">
                {condition}
              </span>
            </div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRentClick?.();
          }}
          disabled={buttonDisabled}
          className={`w-full py-3 font-semibold rounded-full transition ${
            buttonDisabled
              ? "btn-disabled"
              : "btn-primary hover:shadow-xl hover:shadow-primary-500/30"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
