import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date validation utilities
export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr + 'T00:00:00');
  return selectedDate < today;
}

export function isDateTimeInPast(dateTimeStr: string): boolean {
  const selectedDateTime = new Date(dateTimeStr);
  const now = new Date();
  return selectedDateTime < now;
}

export function getCurrentDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getCurrentDateTimeString(): string {
  return new Date().toISOString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function generateBookingReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK-${dateStr}-${random}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateTotalPrice(
  basePrice: number,
  seats: number,
  taxRate: number = 0.05
): { subtotal: number; tax: number; total: number } {
  const subtotal = basePrice * seats;
  const tax = subtotal * taxRate;
  return {
    subtotal,
    tax: Math.round(tax * 100) / 100,
    total: Math.round((subtotal + tax) * 100) / 100,
  };
}

export function isSeatAvailable(
  seatStatus: string,
  selectedSeats: number[],
  seatNumber: number
): boolean {
  if (seatStatus === 'booked') return false;
  if (seatStatus === 'reserved') return false;
  if (selectedSeats.includes(seatNumber)) return true;
  return seatStatus === 'available';
}

export function getSeatPosition(
  seatNumber: number,
  seatsPerRow: number,
  aisleAfter: number
): { row: number; position: string } {
  const row = Math.ceil(seatNumber / seatsPerRow);
  const positionInRow = seatNumber % seatsPerRow;
  const position = positionInRow === 0 ? seatsPerRow : positionInRow;
  const side = position <= aisleAfter ? 'left' : 'right';
  return { row, position: `${side}-${position}` };
}

export function getSeatLabel(seatNumber: number): string {
  const row = Math.ceil(seatNumber / 4);
  const position = seatNumber % 4;
  const letter = position === 1 ? 'A' : position === 2 ? 'B' : position === 3 ? 'C' : 'D';
  return `${row}${letter}`;
}

export function getBusTypeIcon(type: string): string {
  switch (type) {
    case 'luxury':
      return '🚐';
    case 'sleeper':
      return '🛏️';
    case 'semi-sleeper':
      return '💺';
    default:
      return '🚌';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    case 'scheduled':
      return 'bg-primary-100 text-primary-700';
    case 'departed':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-secondary-100 text-secondary-700';
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const CITIES = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Comilla',
  'Coxs Bazar',
  'Narayanganj',
  'Gazipur',
  'Mymensingh',
  'Tangail',
  'Bogura',
  'Jessore',
  'Dinajpur',
  'Pabna',
  'Noakhali',
  'Feni',
  'Savar',
];

export const BUS_TYPES = [
  { value: 'standard', label: 'Standard', description: 'Affordable travel with essential amenities' },
  { value: 'semi-sleeper', label: 'Semi-Sleeper', description: 'Reclining seats for comfortable journey' },
  { value: 'sleeper', label: 'Sleeper', description: 'Bunk beds for overnight journeys' },
  { value: 'luxury', label: 'Luxury', description: 'Premium experience with all amenities' },
];

// Generate ticket data for PDF
export interface TicketData {
  bookingReference: string;
  passengerName: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  busName: string;
  busType: string;
  seats: number[];
  price: number;
}

export function generateTicketHTML(ticket: TicketData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transitly - Ticket ${ticket.bookingReference}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
        .ticket { max-width: 600px; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 24px; text-align: center; }
        .header h1 { font-size: 24px; margin-bottom: 4px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 24px; }
        .ref { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
        .ref span { font-family: monospace; font-size: 18px; font-weight: bold; color: #4f46e5; }
        .passenger { background: #f0fdf4; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #bbf7d0; }
        .passenger span { font-size: 14px; color: #166534; font-weight: 600; }
        .route { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; }
        .city { text-align: center; }
        .city h3 { font-size: 18px; color: #111827; }
        .city p { font-size: 12px; color: #6b7280; }
        .arrow { color: #6366f1; font-size: 24px; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .detail-item { background: #f9fafb; padding: 12px; border-radius: 8px; }
        .detail-item label { display: block; font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
        .detail-item span { font-size: 14px; font-weight: 500; color: #111827; }
        .seats { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
        .seats h4 { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
        .seat-numbers { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .seat { background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; }
        .price { text-align: center; padding: 16px; background: #ecfdf5; border-radius: 8px; margin-bottom: 24px; }
        .price span { font-size: 24px; font-weight: bold; color: #059669; }
        .footer { background: #f9fafb; padding: 16px; text-align: center; border-top: 1px dashed #e5e7eb; }
        .footer p { font-size: 12px; color: #6b7280; }
        .print-btn { display: block; margin: 20px auto; padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .print-btn:hover { background: #4f46e5; }
        @media print { .print-btn { display: none; } }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h1>🚌 Transitly</h1>
          <p>E-Ticket</p>
        </div>
        <div class="content">
          <div class="ref">
            Booking Reference: <span>${ticket.bookingReference}</span>
          </div>
          
          <div class="passenger">
            Passenger Name: <span>${ticket.passengerName}</span>
          </div>
          
          <div class="route">
            <div class="city">
              <h3>${ticket.fromCity}</h3>
              <p>Departure</p>
            </div>
            <div class="arrow">→</div>
            <div class="city">
              <h3>${ticket.toCity}</h3>
              <p>Arrival</p>
            </div>
          </div>
          
          <div class="details">
            <div class="detail-item">
              <label>Date</label>
              <span>${ticket.departureDate}</span>
            </div>
            <div class="detail-item">
              <label>Departure Time</label>
              <span>${ticket.departureTime}</span>
            </div>
            <div class="detail-item">
              <label>Arrival Time</label>
              <span>${ticket.arrivalTime}</span>
            </div>
            <div class="detail-item">
              <label>Bus</label>
              <span>${ticket.busName} (${ticket.busType})</span>
            </div>
          </div>
          
          <div class="seats">
            <h4>SEAT NUMBER(S)</h4>
            <div class="seat-numbers">
              ${ticket.seats.map(s => `<span class="seat">${s}</span>`).join('')}
            </div>
          </div>
          
          <div class="price">
            Total Paid: <span>৳${ticket.price.toLocaleString('en-BD')}</span>
          </div>
        </div>
        <div class="footer">
          <p>Please arrive at least 30 minutes before departure. Show this ticket at the boarding point.</p>
          <p>Generated by Transitly - Your Trusted Travel Partner</p>
        </div>
      </div>
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </body>
    </html>
  `;
}

export function downloadTicketPDF(ticket: TicketData): void {
  const html = generateTicketHTML(ticket);
  // Open in new window and trigger print dialog for PDF save
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}
