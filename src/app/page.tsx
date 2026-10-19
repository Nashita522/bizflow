"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AuthPage from "@/components/auth-page";

type Section = "Overview" | "Customers" | "Invoices" | "Bookings" | "Tasks";

type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: "Active" | "Lead";
};

type InvoiceStatus = "Draft" | "Paid" | "Pending" | "Overdue";

type Invoice = {
  id: string;
  invoice_number: string;
  customer: string;
  invoice_date: string;
  amount: number;
  status: InvoiceStatus;
};

const navigation: { name: Section; icon: string }[] = [
  { name: "Overview", icon: "▦" },
  { name: "Customers", icon: "♙" },
  { name: "Invoices", icon: "▤" },
  { name: "Bookings", icon: "▦" },
  { name: "Tasks", icon: "✓" },
];

const initialCustomers: Customer[] = [
  { id: "C-001", name: "Sarah Johnson", company: "Bright Studio", email: "sarah@example.com", status: "Active" },
  { id: "C-002", name: "Michael Chen", company: "Northstar Co.", email: "michael@example.com", status: "Active" },
  { id: "C-003", name: "Ayesha Rahman", company: "Ayesha Designs", email: "ayesha@example.com", status: "Lead" },
  { id: "C-004", name: "David Wilson", company: "Wilson Consulting", email: "david@example.com", status: "Active" },
];

type Booking = {
  id: string;
  title: string;
  customer: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
};

type Task = {
  id: string;
  title: string;
  due: string;
  done: boolean;
};

function Badge({ children }: { children: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    Lead: "bg-violet-50 text-violet-700",
    Paid: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Overdue: "bg-rose-50 text-rose-700",
    Confirmed: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[children] ?? "bg-slate-100 text-slate-600"}`}>
      {children}
    </span>
  );
}

function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="px-5 py-8 text-center text-sm text-slate-500">{text}</p>;
}

function Dashboard({ user }: { user: User }) {
  const [activePage, setActivePage] = useState<Section>("Overview");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceCustomer, setInvoiceCustomer] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("Pending");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingCustomer, setBookingCustomer] = useState("");
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingStatus, setBookingStatus] = useState<Booking["status"]>("Pending");
  const [search, setSearch] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, company, email, status")
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        setNotice(`Could not load customers: ${error.message}`);
        return;
      }

      const loaded: Customer[] = (data ?? []).map(
        (row: {
          id: string | number;
          name: string;
          company: string;
          email: string;
          status: string;
        }) => ({
          id: String(row.id),
          name: row.name,
          company: row.company,
          email: row.email,
          status: row.status === "Active" ? "Active" : "Lead",
        })
      );

      setCustomers(loaded);
    }

    void loadCustomers();

    return () => {
      active = false;
    };
  }, [user.id]);




  useEffect(() => {
    let active = true;

    async function loadInvoices() {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, customer, invoice_date, amount, status")
        .eq("user_id", user.id)
        .order("invoice_date", { ascending: false });

      if (!active) return;
      if (error) {
        setNotice(`Could not load invoices: ${error.message}`);
        return;
      }

      const loaded: Invoice[] = (data ?? []).map((row: {
        id: string;
        invoice_number: string;
        customer: string;
        invoice_date: string;
        amount: number | string;
        status: string;
      }) => ({
        id: String(row.id),
        invoice_number: row.invoice_number,
        customer: row.customer,
        invoice_date: row.invoice_date,
        amount: Number(row.amount),
        status: (["Draft", "Paid", "Pending", "Overdue"].includes(row.status)
          ? row.status
          : "Pending") as InvoiceStatus,
      }));

      setInvoices(loaded);
    }

    void loadInvoices();
    return () => {
      active = false;
    };
  }, [user.id]);  useEffect(() => {
    let active = true;

    async function loadBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, title, customer, booking_date, booking_time, status")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true });

      if (!active) return;
      if (error) {
        setNotice(`Could not load bookings: ${error.message}`);
        return;
      }

      const loaded: Booking[] = (data ?? []).map((row: {
        id: string;
        title: string;
        customer: string;
        booking_date: string;
        booking_time: string;
        status: string;
      }) => ({
        id: row.id,
        title: row.title,
        customer: row.customer,
        date: new Date(`${row.booking_date}T00:00:00`).toLocaleDateString(
          "en-US", { month: "short", day: "numeric", year: "numeric" }
        ),
        time: row.booking_time,
        status: (["Pending", "Confirmed", "Cancelled", "Completed"].includes(row.status)
          ? row.status : "Pending") as Booking["status"],
      }));

      setBookings(loaded);
    }

    async function loadTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, due, done")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!active) return;
      if (error) {
        setNotice(`Could not load tasks: ${error.message}`);
        return;
      }

      setTasks((data ?? []).map((row: {
        id: string;
        title: string;
        due: string;
        done: boolean;
      }) => ({
        id: row.id,
        title: row.title,
        due: row.due,
        done: row.done,
      })));
    }

    void loadBookings();
    void loadTasks();

    return () => {
      active = false;
    };
  }, [user.id]);

const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.company} ${customer.email} ${customer.id}`
        .toLowerCase()
        .includes(term)
    );
  }, [customers, search]);

  function cancelCustomerForm() {
    setShowCustomerForm(false);
    setEditingCustomerId(null);
    setCustomerName("");
    setCustomerCompany("");
    setCustomerEmail("");
    setNotice("");
  }

  function startEditCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerCompany(customer.company);
    setCustomerEmail(customer.email);
    setShowCustomerForm(true);
    setNotice("");
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const name = customerName.trim();
    const company = customerCompany.trim();
    const email = customerEmail.trim();

    if (!name || !company || !email) {
      setNotice("Please complete all customer fields.");
      return;
    }

    if (editingCustomerId) {
      const { data, error } = await supabase
        .from("customers")
        .update({ name, company, email })
        .eq("id", editingCustomerId)
        .eq("user_id", user.id)
        .select("id, name, company, email, status")
        .maybeSingle();

      if (error) {
        setNotice(`Could not update customer: ${error.message}`);
        return;
      }

      if (!data) {
        setNotice("Customer was not found or you do not have permission to update it.");
        return;
      }

      const updated: Customer = {
        id: String(data.id),
        name: data.name,
        company: data.company,
        email: data.email,
        status: data.status === "Active" ? "Active" : "Lead",
      };

      setCustomers((current) =>
        current.map((item) => item.id === editingCustomerId ? updated : item)
      );
      setNotice("Customer updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          name,
          company,
          email,
          status: "Lead",
        })
        .select("id, name, company, email, status")
        .single();

      if (error) {
        setNotice(`Could not save customer: ${error.message}`);
        return;
      }

      const customer: Customer = {
        id: String(data.id),
        name: data.name,
        company: data.company,
        email: data.email,
        status: data.status === "Active" ? "Active" : "Lead",
      };

      setCustomers((current) => [...current, customer]);
      setNotice("Customer saved to your account.");
    }

    setCustomerName("");
    setCustomerCompany("");
    setCustomerEmail("");
    setEditingCustomerId(null);
    setShowCustomerForm(false);
    setSearch("");
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Delete ${customer.name} (${customer.company})? This cannot be undone.`
    );
    if (!confirmed) return;

    setNotice("");

    const { data, error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      setNotice(`Could not delete customer: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      setNotice("Customer was not found or you do not have permission to delete it.");
      return;
    }

    setCustomers((current) => current.filter((item) => item.id !== customer.id));

    if (editingCustomerId === customer.id) {
      cancelCustomerForm();
    }

    setNotice("Customer deleted successfully.");
  }

  function resetBookingForm() {
    setEditingBookingId(null);
    setBookingTitle("");
    setBookingCustomer("");
    const today = new Date();
    setBookingDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
    setBookingTime("10:00");
    setBookingStatus("Pending");
  }

  function cancelBookingForm() {
    resetBookingForm();
    setShowBookingForm(false);
    setNotice("");
  }

  function startEditBooking(booking: Booking) {
    const parsedDate = new Date(booking.date);
    if (Number.isNaN(parsedDate.getTime())) {
      setNotice("Could not read this booking date. Please refresh and try again.");
      return;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    setEditingBookingId(booking.id);
    setBookingTitle(booking.title);
    setBookingCustomer(booking.customer);
    setBookingDate(`${year}-${month}-${day}`);
    setBookingTime(booking.time);
    setBookingStatus(booking.status);
    setShowBookingForm(true);
    setNotice("");
  }

  async function addBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const title = bookingTitle.trim();
    const customer = bookingCustomer.trim();

    if (!title || !customer || !bookingDate || !bookingTime) {
      setNotice("Please complete all booking fields.");
      return;
    }

    const values = {
      title,
      customer,
      booking_date: bookingDate,
      booking_time: bookingTime,
      status: bookingStatus,
    };

    if (editingBookingId) {
      const { data, error } = await supabase
        .from("bookings")
        .update(values)
        .eq("id", editingBookingId)
        .eq("user_id", user.id)
        .select("id, title, customer, booking_date, booking_time, status")
        .maybeSingle();

      if (error) {
        setNotice(`Could not update booking: ${error.message}`);
        return;
      }
      if (!data) {
        setNotice("Booking was not found or you do not have permission to update it.");
        return;
      }

      const updated: Booking = {
        id: data.id,
        title: data.title,
        customer: data.customer,
        date: new Date(`${data.booking_date}T00:00:00`).toLocaleDateString(
          "en-US", { month: "short", day: "numeric", year: "numeric" }
        ),
        time: data.booking_time,
        status: data.status as Booking["status"],
      };

      setBookings((current) =>
        current.map((item) => item.id === updated.id ? updated : item)
      );
      resetBookingForm();
      setShowBookingForm(false);
      setNotice("Booking updated successfully.");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({ user_id: user.id, ...values })
      .select("id, title, customer, booking_date, booking_time, status")
      .single();

    if (error) {
      setNotice(`Could not save booking: ${error.message}`);
      return;
    }

    const saved: Booking = {
      id: data.id,
      title: data.title,
      customer: data.customer,
      date: new Date(`${data.booking_date}T00:00:00`).toLocaleDateString(
        "en-US", { month: "short", day: "numeric", year: "numeric" }
      ),
      time: data.booking_time,
      status: data.status as Booking["status"],
    };

    setBookings((current) => [...current, saved]);
    resetBookingForm();
    setShowBookingForm(false);
    setNotice("Booking saved to your account.");
  }

  async function deleteBooking(booking: Booking) {
    const confirmed = window.confirm(
      `Delete booking "${booking.title}" for ${booking.customer}? This cannot be undone.`
    );
    if (!confirmed) return;

    setNotice("");
    const { data, error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", booking.id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      setNotice(`Could not delete booking: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setNotice("Booking was not found or you do not have permission to delete it.");
      return;
    }

    setBookings((current) => current.filter((item) => item.id !== booking.id));
    if (editingBookingId === booking.id) {
      resetBookingForm();
      setShowBookingForm(false);
    }
    setNotice("Booking deleted successfully.");
  }

  function resetTaskForm() {
    setEditingTaskId(null);
    setTaskTitle("");
    const today = new Date();
    setTaskDue(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
  }

  function cancelTaskForm() {
    resetTaskForm();
    setShowTaskForm(false);
    setNotice("");
  }

  function startEditTask(task: Task) {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDue(task.due);
    setShowTaskForm(true);
    setNotice("");
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const title = taskTitle.trim();
    if (!title || !taskDue) {
      setNotice("Please enter a task title and due date.");
      return;
    }

    if (editingTaskId) {
      const { data, error } = await supabase
        .from("tasks")
        .update({ title, due: taskDue })
        .eq("id", editingTaskId)
        .eq("user_id", user.id)
        .select("id, title, due, done")
        .maybeSingle();

      if (error) {
        setNotice(`Could not update task: ${error.message}`);
        return;
      }
      if (!data) {
        setNotice("Task was not found or you do not have permission to update it.");
        return;
      }

      const updated: Task = {
        id: data.id,
        title: data.title,
        due: data.due,
        done: data.done,
      };

      setTasks((current) =>
        current.map((task) => task.id === updated.id ? updated : task)
      );
      resetTaskForm();
      setShowTaskForm(false);
      setNotice("Task updated successfully.");
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title,
        due: taskDue,
        done: false,
      })
      .select("id, title, due, done")
      .single();

    if (error) {
      setNotice(`Could not save task: ${error.message}`);
      return;
    }

    const saved: Task = {
      id: data.id,
      title: data.title,
      due: data.due,
      done: data.done,
    };

    setTasks((current) => [...current, saved]);
    resetTaskForm();
    setShowTaskForm(false);
    setNotice("Task saved to your account.");
  }

  async function deleteTask(task: Task) {
    const confirmed = window.confirm(
      `Delete task "${task.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setNotice("");
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      setNotice(`Could not delete task: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setNotice("Task was not found or you do not have permission to delete it.");
      return;
    }

    setTasks((current) => current.filter((item) => item.id !== task.id));
    if (editingTaskId === task.id) {
      resetTaskForm();
      setShowTaskForm(false);
    }
    setNotice("Task deleted successfully.");
  }

  async function toggleTask(taskId: string, done: boolean) {
    setNotice("");

    const previous = tasks;
    setTasks((current) =>
      current.map((task) => task.id === taskId ? { ...task, done } : task)
    );

    const { error } = await supabase
      .from("tasks")
      .update({ done })
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      setTasks(previous);
      setNotice(`Could not update task: ${error.message}`);
      return;
    }

    setNotice("Task updated.");
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid");
  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending" || invoice.status === "Overdue"
  );
  const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const outstandingAmount = outstandingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const invoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  function resetInvoiceForm() {
    setEditingInvoiceId(null);
    setInvoiceNumber("");
    setInvoiceCustomer("");
    const today = new Date();
    setInvoiceDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
    setInvoiceAmount("");
    setInvoiceStatus("Pending");
  }

  function cancelInvoiceForm() {
    resetInvoiceForm();
    setShowInvoiceForm(false);
    setNotice("");
  }

  function startEditInvoice(invoice: Invoice) {
    setEditingInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoice_number);
    setInvoiceCustomer(invoice.customer);
    setInvoiceDate(invoice.invoice_date);
    setInvoiceAmount(String(invoice.amount));
    setInvoiceStatus(invoice.status);
    setShowInvoiceForm(true);
    setNotice("");
  }

  async function addInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const number = invoiceNumber.trim();
    const customer = invoiceCustomer.trim();
    const amount = Number(invoiceAmount);

    if (!number || !customer || !invoiceDate || !invoiceAmount.trim() ||
        !Number.isFinite(amount) || amount < 0) {
      setNotice("Please enter a valid invoice number, customer, date and non-negative amount.");
      return;
    }

    const values = {
      invoice_number: number,
      customer,
      invoice_date: invoiceDate,
      amount,
      status: invoiceStatus,
    };

    if (editingInvoiceId) {
      const { data, error } = await supabase
        .from("invoices")
        .update(values)
        .eq("id", editingInvoiceId)
        .eq("user_id", user.id)
        .select("id, invoice_number, customer, invoice_date, amount, status")
        .maybeSingle();

      if (error) {
        setNotice(`Could not update invoice: ${error.message}`);
        return;
      }
      if (!data) {
        setNotice("Invoice was not found or you do not have permission to update it.");
        return;
      }

      const updated: Invoice = {
        id: String(data.id),
        invoice_number: data.invoice_number,
        customer: data.customer,
        invoice_date: data.invoice_date,
        amount: Number(data.amount),
        status: data.status as InvoiceStatus,
      };

      setInvoices((current) =>
        current.map((invoice) => invoice.id === updated.id ? updated : invoice)
          .sort((a, b) => b.invoice_date.localeCompare(a.invoice_date))
      );
      resetInvoiceForm();
      setShowInvoiceForm(false);
      setNotice("Invoice updated successfully.");
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .insert({ user_id: user.id, ...values })
      .select("id, invoice_number, customer, invoice_date, amount, status")
      .single();

    if (error) {
      setNotice(`Could not save invoice: ${error.message}`);
      return;
    }

    const saved: Invoice = {
      id: String(data.id),
      invoice_number: data.invoice_number,
      customer: data.customer,
      invoice_date: data.invoice_date,
      amount: Number(data.amount),
      status: data.status as InvoiceStatus,
    };

    setInvoices((current) =>
      [saved, ...current].sort((a, b) => b.invoice_date.localeCompare(a.invoice_date))
    );
    resetInvoiceForm();
    setShowInvoiceForm(false);
    setNotice("Invoice saved to your account.");
  }

  async function deleteInvoice(invoice: Invoice) {
    const confirmed = window.confirm(
      `Delete invoice ${invoice.invoice_number}? This cannot be undone.`
    );
    if (!confirmed) return;

    setNotice("");
    const { data, error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoice.id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      setNotice(`Could not delete invoice: ${error.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setNotice("Invoice was not found or you do not have permission to delete it.");
      return;
    }

    setInvoices((current) => current.filter((item) => item.id !== invoice.id));
    if (editingInvoiceId === invoice.id) {
      resetInvoiceForm();
      setShowInvoiceForm(false);
    }
    setNotice("Invoice deleted successfully.");
  }

  const moneyCards = [
    { label: "Total revenue", value: formatCurrency(paidRevenue), change: `${paidInvoices.length} paid invoices`, icon: "$", color: "bg-indigo-50 text-indigo-600" },
    { label: "Outstanding", value: formatCurrency(outstandingAmount), change: `${outstandingInvoices.length} invoices`, icon: "↗", color: "bg-amber-50 text-amber-600" },
    { label: "Customers", value: String(customers.length), change: "In your list", icon: "♙", color: "bg-sky-50 text-sky-600" },
    { label: "Upcoming bookings", value: String(bookings.length), change: "Next 7 days", icon: "▦", color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">B</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950">BizFlow</h1>
              <p className="text-xs text-slate-500">Business workspace</p>
            </div>
          </div>

          <div className="px-4 pt-7">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Workspace</p>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name);
                    setSearch("");
                    setNotice("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    activePage === item.name
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <span className="w-5 text-center text-lg">{item.icon}</span>
                  {item.name}
                  {item.name === "Tasks" && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                      {tasks.filter((task) => !task.done).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold">Your business, organized.</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">
                Manage customer relationships and everyday workflows in one place.
              </p>
              <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">Demo workspace</span>
            </div>
            <p className="px-2 pt-4 text-xs text-slate-400">BizFlow · Product preview</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7 lg:px-10">
              <div>
                <p className="text-xs font-medium text-slate-500">Workspace / {activePage}</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Good morning 👋</h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex">
                  <span className="text-slate-400">⌕</span>
                  <input
                    aria-label="Search customers"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search customers..."
                    className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400 lg:w-48"
                  />
                </label>
                <div className="hidden max-w-48 truncate text-sm text-slate-500 lg:block">{user.email}</div>
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) setNotice(`Could not sign out: ${error.message}`);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Log out
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActivePage(item.name)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                    activePage === item.name ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-10 lg:py-9">
            {notice && (
              <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {notice}
              </div>
            )}

            {activePage === "Overview" && (
              <>
                <SectionTitle
                  title="Business overview"
                  description="Here is what's happening with your business today."
                  action={
                    <button onClick={() => setActivePage("Customers")} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                      View customers <span className="ml-2">→</span>
                    </button>
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {moneyCards.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${card.color}`}>{card.icon}</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{card.value}</p>
                      <p className="mt-2 text-xs text-slate-500">{card.change}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100/70">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                      <div>
                        <h3 className="font-bold text-slate-900">Recent invoices</h3>
                        <p className="mt-1 text-xs text-slate-500">A quick look at your latest billing</p>
                      </div>
                      <button onClick={() => setActivePage("Invoices")} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View all →</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                          <tr><th className="px-5 py-3 font-semibold">Invoice</th><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Amount</th><th className="px-5 py-3 font-semibold">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.slice(0, 3).map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-slate-50/70">
                              <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">{invoice.invoice_number}</td>
                              <td className="whitespace-nowrap px-5 py-4 text-slate-600">{invoice.customer}</td>
                              <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">{formatCurrency(invoice.amount)}</td>
                              <td className="px-5 py-4"><Badge>{invoice.status}</Badge></td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <button type="button" onClick={() => startEditInvoice(invoice)} className="mr-3 font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                            <button type="button" onClick={() => void deleteInvoice(invoice)} className="font-medium text-rose-600 hover:text-rose-800">Delete</button>
                          </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">Upcoming bookings</h3>
                        <p className="mt-1 text-xs text-slate-500">Your next scheduled appointments</p>
                      </div>
                      <button onClick={() => setActivePage("Bookings")} className="text-sm font-semibold text-indigo-600">View all →</button>
                    </div>
                    <div className="mt-5 space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.title} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">
                            <span>{booking.date.split(" ")[0]}</span><span>{booking.date.split(" ")[1].replace(",", "")}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{booking.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{booking.customer} · {booking.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Tasks to keep things moving</h3>
                      <p className="mt-1 text-xs text-slate-500">Small steps, clear priorities</p>
                    </div>
                    <button onClick={() => setActivePage("Tasks")} className="text-sm font-semibold text-indigo-600">View tasks →</button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {tasks.filter((task) => !task.done).slice(0, 4).map((task) => (
                      <div key={task.title} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        <span className="flex-1 text-sm text-slate-700">{task.title}</span>
                        <span className="text-xs text-slate-400">{task.due}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activePage === "Customers" && (
              <>
                <SectionTitle
                  title="Customers"
                  description="Keep customer details organized in one place."
                  action={<button onClick={() => showCustomerForm ? cancelCustomerForm() : (setEditingCustomerId(null), setShowCustomerForm(true))} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">{showCustomerForm ? "Cancel" : "+ Add customer"}</button>}
                />

                {showCustomerForm && (
                  <form onSubmit={saveCustomer} className="mb-6 grid gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:grid-cols-2">
                    <div>
                      <label htmlFor="customerName" className="mb-1.5 block text-sm font-medium">Contact name</label>
                      <input id="customerName" required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Alex Morgan" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label htmlFor="customerCompany" className="mb-1.5 block text-sm font-medium">Business name</label>
                      <input id="customerCompany" required value={customerCompany} onChange={(event) => setCustomerCompany(event.target.value)} placeholder="e.g. Morgan Studio" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="customerEmail" className="mb-1.5 block text-sm font-medium">Email address</label>
                      <input id="customerEmail" type="email" required value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="alex@business.com" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{editingCustomerId ? "Update customer" : "Save customer"}</button>
                    </div>
                  </form>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100/70">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
                    <div><h3 className="font-bold text-slate-900">All customers</h3><p className="mt-1 text-xs text-slate-500">{filteredCustomers.length} customer records in this demo</p></div>
                    <input aria-label="Filter customers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter customers..." className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 sm:max-w-64" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Company</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Actions</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-slate-50/70">
                            <td className="whitespace-nowrap px-5 py-4"><div className="font-semibold text-slate-800">{customer.name}</div><div className="mt-1 text-xs text-slate-400">{customer.id}</div></td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.company}</td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">{customer.email}</td>
                            <td className="px-5 py-4"><Badge>{customer.status}</Badge></td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <button type="button" onClick={() => startEditCustomer(customer)} className="mr-3 font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                              <button type="button" onClick={() => void deleteCustomer(customer)} className="font-medium text-red-600 hover:text-red-800">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredCustomers.length === 0 && <EmptyNote text="No matching customers. Try another search." />}
                  </div>
                </div>
              </>
            )}

            {activePage === "Invoices" && (
              <>
                <SectionTitle
                  title="Invoices"
                  description="Track billing status and outstanding payments."
                  action={
                    <button
                      type="button"
                      onClick={() => { if (showInvoiceForm) { cancelInvoiceForm(); } else { resetInvoiceForm(); setShowInvoiceForm(true); } }}
                      className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      {showInvoiceForm ? "Cancel" : "+ Add invoice"}
                    </button>
                  }
                />

                {showInvoiceForm && (
                  <form onSubmit={addInvoice} className="mb-6 grid gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:grid-cols-2">
                    <div>
                      <label htmlFor="invoiceNumber" className="mb-1.5 block text-sm font-medium">Invoice number</label>
                      <input id="invoiceNumber" required value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} placeholder="e.g. INV-1043" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label htmlFor="invoiceCustomer" className="mb-1.5 block text-sm font-medium">Customer / business</label>
                      <input id="invoiceCustomer" required value={invoiceCustomer} onChange={(event) => setInvoiceCustomer(event.target.value)} placeholder="e.g. Bright Studio" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label htmlFor="invoiceDate" className="mb-1.5 block text-sm font-medium">Invoice date</label>
                      <input id="invoiceDate" type="date" required value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label htmlFor="invoiceAmount" className="mb-1.5 block text-sm font-medium">Amount (USD)</label>
                      <input id="invoiceAmount" type="number" min="0" step="0.01" required value={invoiceAmount} onChange={(event) => setInvoiceAmount(event.target.value)} placeholder="e.g. 1250.00" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label htmlFor="invoiceStatus" className="mb-1.5 block text-sm font-medium">Status</label>
                      <select id="invoiceStatus" value={invoiceStatus} onChange={(event) => setInvoiceStatus(event.target.value as InvoiceStatus)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{editingInvoiceId ? "Update invoice" : "Save invoice"}</button>
                    </div>
                  </form>
                )}

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total listed</p><p className="mt-2 text-2xl font-bold">{formatCurrency(invoiceTotal)}</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Paid invoices</p><p className="mt-2 text-2xl font-bold text-emerald-600">{paidInvoices.length}</p></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Need attention</p><p className="mt-2 text-2xl font-bold text-amber-600">{outstandingInvoices.length}</p></div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="whitespace-nowrap px-5 py-4 font-semibold">{invoice.invoice_number}</td>
                          <td className="whitespace-nowrap px-5 py-4">{invoice.customer}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-500">{new Date(`${invoice.invoice_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="whitespace-nowrap px-5 py-4 font-medium">{formatCurrency(invoice.amount)}</td>
                          <td className="px-5 py-4"><Badge>{invoice.status}</Badge></td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <button
                              type="button"
                              onClick={() => startEditInvoice(invoice)}
                              className="mr-3 font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteInvoice(invoice)}
                              className="font-medium text-rose-600 hover:text-rose-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoices.length === 0 && <EmptyNote text="No invoices yet. Select Add invoice to create your first invoice." />}
                </div>
              </>
            )}


            {activePage === "Bookings" && (
              <>
                <SectionTitle
                  title="Bookings"
                  description="Keep appointments and client sessions in view."
                  action={
                    <button
                      type="button"
                      onClick={() => showBookingForm ? cancelBookingForm() : (resetBookingForm(), setShowBookingForm(true))}
                      className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      {showBookingForm ? "Cancel" : "+ Add booking"}
                    </button>
                  }
                />

                {showBookingForm && (
                  <form onSubmit={addBooking} className="mb-6 grid gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:grid-cols-2">
                    <div>
                      <label htmlFor="bookingTitle" className="mb-1.5 block text-sm font-medium">Booking title</label>
                      <input id="bookingTitle" required value={bookingTitle} onChange={(event) => setBookingTitle(event.target.value)} placeholder="e.g. Project kickoff" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="bookingCustomer" className="mb-1.5 block text-sm font-medium">Customer / business</label>
                      <input id="bookingCustomer" required value={bookingCustomer} onChange={(event) => setBookingCustomer(event.target.value)} placeholder="e.g. Bright Studio" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="bookingDate" className="mb-1.5 block text-sm font-medium">Date</label>
                      <input id="bookingDate" type="date" required value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="bookingTime" className="mb-1.5 block text-sm font-medium">Time</label>
                      <input id="bookingTime" type="time" required value={bookingTime} onChange={(event) => setBookingTime(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label htmlFor="bookingStatus" className="mb-1.5 block text-sm font-medium">Status</label>
                      <select id="bookingStatus" value={bookingStatus} onChange={(event) => setBookingStatus(event.target.value as Booking["status"])} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{editingBookingId ? "Update booking" : "Save booking"}</button>
                    </div>
                  </form>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
                        <span>{booking.date.split(" ")[0]}</span>
                        <span>{booking.date.split(" ")[1].replace(",", "")}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-bold text-slate-900">{booking.title}</h3>
                          <Badge>{booking.status}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{booking.customer}</p>
                        <p className="mt-1 text-xs text-slate-500">{booking.date} · {booking.time}</p>
                        <div className="mt-3 flex gap-4">
                          <button type="button" onClick={() => startEditBooking(booking)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                          <button type="button" onClick={() => void deleteBooking(booking)} className="text-sm font-medium text-rose-600 hover:text-rose-800">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {bookings.length === 0 && <EmptyNote text="No bookings yet. Select Add booking to create your first booking." />}
              </>
            )}

            {activePage === "Tasks" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionTitle title="Tasks" description="Track follow-ups and the next steps for your business." />
                  <button type="button" onClick={() => { if (showTaskForm) { cancelTaskForm(); } else { resetTaskForm(); setShowTaskForm(true); } }} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                    {showTaskForm ? "Cancel" : "+ Add Task"}
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="font-bold">Your task list</h3>
                    <span className="text-xs text-slate-500">{tasks.filter((task) => !task.done).length} remaining</span>
                  </div>
                  {showTaskForm && (
                    <form onSubmit={addTask} className="grid gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="taskTitle" className="mb-1.5 block text-sm font-medium">Task title</label>
                        <input
                          id="taskTitle"
                          required
                          value={taskTitle}
                          onChange={(event) => setTaskTitle(event.target.value)}
                          placeholder="e.g. Follow up with a customer"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="taskDue" className="mb-1.5 block text-sm font-medium">Due date</label>
                        <input
                          id="taskDue"
                          type="date"
                          required
                          value={taskDue}
                          onChange={(event) => setTaskDue(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                          {editingTaskId ? "Update task" : "Save task"}
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(event) => void toggleTask(task.id, event.target.checked)}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <span className={`flex-1 text-sm ${task.done ? "text-slate-400 line-through" : "font-medium text-slate-800"}`}>{task.title}</span>
                        <span className="whitespace-nowrap text-xs text-slate-500">{task.due}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => startEditTask(task)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                          <button type="button" onClick={() => void deleteTask(task)} className="text-sm font-medium text-rose-600 hover:text-rose-800">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {tasks.length === 0 && <EmptyNote text="No tasks yet. Tasks will appear here when added to your account." />}
              </>
            )}

            <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
              <p>© 2026 BizFlow. Product preview.</p>
              <p>Your bookings, tasks, customers and invoices are saved to your account.</p>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}


export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Checking your session...
      </main>
    );
  }

  if (user) {
    return <Dashboard user={user} />;
  }

  return <AuthPage initialMode="login" />;
}
