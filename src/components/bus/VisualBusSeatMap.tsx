'use client';

import React from 'react';
import { BusTrip, BusBooking } from '@/types';
import { generateBusSeatLayout, SeatLayoutInfo } from '@/lib/services/bookingConcurrency';
import { User, Lock, CheckCircle, Bus, DoorClosed } from 'lucide-react';

interface VisualBusSeatMapProps {
  trip: BusTrip;
  bookings: BusBooking[];
  selectedSeat: string | null;
  onSelectSeat: (seatNum: string) => void;
  disabled?: boolean;
}

export const VisualBusSeatMap: React.FC<VisualBusSeatMapProps> = ({
  trip,
  bookings,
  selectedSeat,
  onSelectSeat,
  disabled = false,
}) => {
  const seats = generateBusSeatLayout(trip, bookings);
  const isTripFull = trip.availableSeats <= 0;

  // Group seats by row (4 seats per row: [col 1, col 2] | AISLE | [col 3, col 4])
  const rows: Record<number, SeatLayoutInfo[]> = {};
  seats.forEach((seat) => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });

  return (
    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-2xl border border-slate-800 max-w-md mx-auto">
      {/* Bus Graphic Shell Top-Down Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-[#EED58E] font-black text-xs">
            STEER
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Executive Shuttle Coach</p>
            <p className="text-[10px] text-slate-400">Front Driver Cab & Passenger Door</p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-slate-300">
          2+2 Seating Aisle
        </div>
      </div>

      {/* Driver Cockpit Graphic Area */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
            <Bus className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Driver Cabin</span>
        </div>

        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
          <DoorClosed className="w-3 h-3 text-emerald-400" /> Entry Door
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="grid grid-cols-4 gap-2 mb-6 text-[10px] text-slate-300 font-bold bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#EED58E] border border-amber-300" />
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600" />
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-400" />
          <span>Locked</span>
        </div>
      </div>

      {/* Seat Grid Layout */}
      <div className="space-y-3">
        {Object.entries(rows).map(([rowNum, rowSeats]) => {
          const leftSide = rowSeats.filter((s) => s.col <= 2);
          const rightSide = rowSeats.filter((s) => s.col > 2);

          return (
            <div key={rowNum} className="flex items-center justify-between">
              {/* Left Side (2 Seats) */}
              <div className="flex space-x-2">
                {leftSide.map((seat) => renderSeatButton(seat))}
              </div>

              {/* Central Aisle */}
              <div className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-2">
                R{rowNum}
              </div>

              {/* Right Side (2 Seats) */}
              <div className="flex space-x-2">
                {rightSide.map((seat) => renderSeatButton(seat))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Seat Confirmation Status Bar */}
      {selectedSeat ? (
        <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-[#1C355E] border border-amber-400/40 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-extrabold text-amber-300 tracking-wider">Selected Seat</p>
            <p className="text-sm font-black text-white">Seat #{selectedSeat}</p>
          </div>
          <span className="text-xs font-extrabold text-[#EED58E] bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
            Ready to Confirm
          </span>
        </div>
      ) : isTripFull ? (
        <div className="mt-6 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-center">
          <p className="text-xs font-black text-rose-300 uppercase tracking-wider">BUS IS FULL</p>
          <p className="text-[10px] text-slate-300 mt-0.5">All 22 seats have been reserved.</p>
        </div>
      ) : null}
    </div>
  );

  function renderSeatButton(seat: SeatLayoutInfo) {
    const isSelected = selectedSeat === seat.seatNumber;
    const isBooked = seat.isOccupied;

    let buttonClass = 'w-10 h-10 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all ';

    if (isBooked) {
      buttonClass += 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed';
    } else if (isSelected) {
      buttonClass += 'bg-gradient-to-br from-[#EED58E] to-amber-400 border-white text-slate-950 font-black scale-105 shadow-lg shadow-amber-400/20';
    } else {
      buttonClass += 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 active:scale-95';
    }

    return (
      <button
        key={seat.seatNumber}
        onClick={() => !isBooked && !disabled && onSelectSeat(seat.seatNumber)}
        disabled={isBooked || disabled}
        className={buttonClass}
        title={isBooked ? `Seat ${seat.seatNumber} (Booked)` : `Select Seat ${seat.seatNumber}`}
      >
        <span>{seat.seatNumber}</span>
        {isBooked ? (
          <User className="w-2.5 h-2.5 opacity-40 mt-0.5" />
        ) : isSelected ? (
          <CheckCircle className="w-2.5 h-2.5 text-slate-950 mt-0.5" />
        ) : null}
      </button>
    );
  }
};
