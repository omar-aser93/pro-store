"use client";

import { useEffect, useState } from "react";
import { getCalendarSummary } from "@/lib/actions/order.actions";
import { Loader2 } from "lucide-react";                    // icons lib auto installed with shadcn
import { cn } from "@/lib/utils";
// react-day-picker library for calendar UI
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";                         // date-fns for date formatting


// Define the type & structure of the calendar summary data
type CalendarSummary = {
  [date: string]: {
    products: { id: string; name: string }[];
    orders: {
      id: string;
      isPaid: boolean;
      isDelivered: boolean;
      totalPrice: string;
    }[];
  };
};

// AdminCalendar component, showing a calendar with activity details
export default function AdminCalendar() {
  // States to manage calendar received data, highlighted days, selected/hovered dates and loading state
  const [summary, setSummary] = useState<CalendarSummary>({});
  const [highlightedDays, setHighlightedDays] = useState<Date[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Effect to Fetch the calendar summary data whenever the current month changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);                  // Set loading state to true while fetching data

      // Calculate start and end dates for the current month
      const startDate = format( new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), "yyyy-MM-dd" );
      const endDate = format( new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), "yyyy-MM-dd" );
      
      // Server-action to Fetch calendar summary data for the month, we pass startDate & endDate
      const res = await getCalendarSummary({ startDate, endDate });
      setSummary(res);               // Update summary state with fetched data

      const dates = Object.keys(res).map((d) => new Date(d));      // Extract the days that have activity
      setHighlightedDays(dates);                                   // Update highlighted days state with these days
      setLoading(false);                                           // Set loading state to false after data is fetched     
    };

    fetchData();                     // call the function
  }, [currentMonth]);

  // Determine active date and its data (to show in details panel)
  const activeDate = selectedDate || hoveredDate;         // Prioritize selected date over hovered date
  const activeKey = activeDate ? format(activeDate, "yyyy-MM-dd") : null;  // Key to access summary
  const activeData = activeKey ? summary[activeKey] : null;                // Data for the active date
  
  const hasActivity = highlightedDays.length > 0;     // variable used to Check if there's any activity for this month

  return (
    <div className="p-4 sm:p-6 flex justify-center">
      <div className="bg-white rounded-xl shadow-lg border p-4 sm:p-6 flex flex-col lg:flex-row gap-6 max-w-5xl w-full relative">
        {/* Calendar Section */}
        <div className=" w-full lg:w-[360px] lg:border-r lg:pr-6 " >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center lg:text-left"> 📅 Calendar </h2>
          <DayPicker mode="single" month={currentMonth} onMonthChange={setCurrentMonth}
            // Day click and hover handlers to manage selected and hovered dates
            onDayClick={(date) => {
              if (selectedDate && format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")) {
                setSelectedDate(null);
              } else {
                setSelectedDate(date);
              }
            }}
            onDayMouseEnter={(date) => { if (!selectedDate) setHoveredDate(date); }}
            onDayMouseLeave={() => { if (!selectedDate) setHoveredDate(null); }}
            // Styling for highlighted and selected days
            modifiers={{ highlighted: highlightedDays,  selected: selectedDate ? [selectedDate] : [] }}
            modifiersStyles={{
              highlighted: {
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                borderRadius: "6px",
              },
              selected: {
                color: "#1e40af",
                borderRadius: "6px",
              },
            }}
          />
        </div>

        {/* Details Panel, Show loading or month activity details */}
        <div className="flex-1 bg-gray-50 rounded-lg border p-4 sm:p-5 shadow-inner relative max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Loading activity...</p>
            </div>
          //if no activity, we'll show a 'no activity' message, else show 'select/hover a date'   
          ) : !hasActivity ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-gray-500">
              <p className="text-lg font-medium">📭 No activity this month</p>
              <p className="text-sm text-gray-400 mt-1"> Try selecting another month to see activity. </p>
            </div>
          ) : activeDate && activeData ? (
            <>
              {/* Date Header */}
              <h3 className="font-semibold text-lg mb-3 text-center lg:text-left">
                {format(activeDate, "MMMM d, yyyy")}
              </h3>

              {/* Products Section, if products added on this day, show them ... else show no products added */}
              <div>
                <p className="font-medium text-blue-600 mb-1">🛍 Products Added</p>
                {activeData.products.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {activeData.products.map((p) => (<li key={p.id}>{p.name}</li>))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No products added</p>
                )}
              </div>

              {/* Orders Section */}
              <div className="mt-5">
                <p className="font-medium text-green-600 mb-2">📦 Orders</p>
                {activeData.orders.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 border-b">
                      <span>Order ID</span>
                      <span className="text-center">Payment</span>
                      <span className="text-center">Delivery</span>
                    </div>

                    {/* Table Rows, displaying order ID, payment status, and delivery status */}
                    <ul className="divide-y divide-gray-200">
                      {activeData.orders.map((o) => (
                        <li key={o.id} className="grid grid-cols-3 items-center px-3 py-2 text-sm" >
                          <span className="truncate">#{o.id.slice(0, 6)}...</span>
                          <span className="flex justify-center">
                            <span title={o.isPaid ? "Paid" : "Not Paid"} className={cn("h-3 w-3 rounded-full", o.isPaid ? "bg-green-500" : "bg-red-500" )} />
                          </span>
                          <span className="flex justify-center">
                            <span title={o.isDelivered ? "Delivered" : "Not Delivered"} className={cn("h-3 w-3 rounded-full", o.isDelivered ? "bg-green-500" : "bg-red-500" )} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No orders placed</p>
                )}
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-green-500" /> Paid / Delivered </div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-red-500" /> Unpaid / Undelivered </div>
              </div>
            </>
          ) : (
            // message when no date is selected or hovered yet
            <div className="text-gray-400 text-center py-10 text-sm">
              Hover or click a date to see details 📌
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
