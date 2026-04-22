import React, { useState, useEffect, useMemo, useReducer, useCallback } from "react";
import {
  getGasConfig, setGasConfig, pingGas, pullFromGas, pushToGas,
  uploadPhotoToGas, deletePhotoFromGas, queueOp, drainQueue,
  getLastSync, setLastSync,
} from "./storage.js";
import {
  Home, Package, ShoppingBag, Users, FileText, TrendingUp, Settings,
  Plus, Search, Filter, AlertTriangle, Clock, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, Edit3, Trash2, Copy, Download, Upload,
  Calendar, MapPin, Tag, DollarSign, Percent, Target, Award,
  ArrowUpRight, ArrowDownRight, Euro, Watch, Gem, ShieldCheck,
  Sparkles, ListChecks, BarChart3, X, Save, Archive,
  Camera, Image as ImageIcon, TrendingDown, Bell, FileDown,
  MessageSquare, RotateCcw, Eye, Zap, PiggyBank, History, Link2,
  Activity, CircleDot, ExternalLink, Wand2, Phone, Building2,
  Cloud, CloudOff, RefreshCw, Link, Loader2
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS — Watch dial aesthetic
// ═══════════════════════════════════════════════════════════
const C = {
  ink:     "#0A0908",   // dial black
  coal:    "#16120E",   // chapter ring
  surface: "#1F1A13",   // sub-dial
  raised:  "#2A2319",   // pushers
  line:    "#3A2F22",   // engraved line
  cream:   "#E8DCC4",   // luminova cream
  dim:     "#A89278",   // aged lume
  mute:    "#6B5944",   // patina
  gold:    "#C9A961",   // yellow gold hands
  copper:  "#B87333",   // rose gold
  jade:    "#7FB069",   // lume green (positive)
  amber:   "#E8B04B",   // amber (warning)
  ruby:    "#D4564D",   // burnt red (danger)
  ice:     "#8BA8B7",   // steel blue (info)
};

// ═══════════════════════════════════════════════════════════
// SEED DATA — derived from real Q2 2026 operations
// ═══════════════════════════════════════════════════════════
const SEED_WATCHES = [
  { id:"w038", brand:"Seiko", model:"SQ 5Y23", mechanism:"Cuarzo", condition:"Buena", purchase_price:60.7, purchase_date:"2026-04-05", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:67.0, sale_channel:"Catawiki", sale_price:67.0, sale_shipping:50.0, sale_date:"2026-04-22", customer_name:"jerome morvan", customer_country:"FR", factura_estado:"PDF pendiente" },
  { id:"w039", brand:"Tissot", model:"Chrono XL", mechanism:"Cuarzo", condition:"Buena", purchase_price:165.95, purchase_date:"2026-03-21", purchase_source:"RealCash", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:195.0, sale_channel:"Catawiki", sale_price:195.0, sale_shipping:50.0, sale_date:"2026-04-22", customer_name:"William Fisher", customer_country:"ES", factura_estado:"PDF pendiente" },
  { id:"w035", brand:"Seiko", model:"Chronograph", mechanism:"Cuarzo", condition:"Buena", purchase_price:98.95, purchase_date:"2026-02-23", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:210.0, sale_channel:"Catawiki", sale_price:210.0, sale_shipping:50.0, sale_date:"2026-04-21", customer_name:"Stefan Grasenhiller", customer_country:"DE", factura_estado:"PDF pendiente" },
  { id:"w036", brand:"Tissot", model:"T-Classic Everytime", mechanism:"Cuarzo", condition:"Buena", purchase_price:94.3, purchase_date:"2026-02-10", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:100.0, sale_channel:"Catawiki", sale_price:100.0, sale_shipping:60.0, sale_date:"2026-04-21", customer_name:"Carlos Rios", customer_country:"PT", factura_estado:"PDF pendiente" },
  { id:"w037", brand:"Thermidor", model:"De Luxe", mechanism:"Automático", condition:"Buena", purchase_price:60.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:100.0, sale_channel:"Catawiki", sale_price:100.0, sale_shipping:50.0, sale_date:"2026-04-21", customer_name:"ENNIO SANDONA", customer_country:"IT", factura_estado:"PDF pendiente" },
  { id:"w034", brand:"Tissot", model:"PR100", mechanism:"Cuarzo", condition:"Buena", purchase_price:74.88, purchase_date:"2026-03-27", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:150.0, sale_channel:"Catawiki", sale_price:150.0, sale_shipping:50.0, sale_date:"2026-04-20", customer_name:"Enrico Giannone", customer_country:"IT", factura_estado:"PDF pendiente" },
  { id:"w032", brand:"Omega", model:"Electronic f300 Hz Chronometer", mechanism:"Electrónico", condition:"Buena", purchase_price:305.55, purchase_date:"2026-03-29", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:600.0, sale_channel:"Catawiki", sale_price:600.0, sale_shipping:60.0, sale_date:"2026-04-19", customer_name:"Rokas Barkauskas", customer_country:"LT", factura_estado:"PDF pendiente" },
  { id:"w033", brand:"Seiko", model:"7S26 Arabic Dial", mechanism:"Automático", condition:"Buena", purchase_price:103.75, purchase_date:"2026-03-26", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:180.0, sale_channel:"Catawiki", sale_price:180.0, sale_shipping:50.0, sale_date:"2026-04-19", customer_name:"Gianluca Cesana", customer_country:"IT", factura_estado:"PDF pendiente" },
  { id:"w030", brand:"Fortis", model:"Vintage Art Deco NOS", mechanism:"Cuerda", condition:"Buena", purchase_price:141.09, purchase_date:"2026-03-30", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:114.0, sale_channel:"Catawiki", sale_price:114.0, sale_shipping:50.0, sale_date:"2026-04-18", customer_name:"Rosario Romano", customer_country:"IT", factura_estado:"PDF pendiente" },
  { id:"w031", brand:"Tissot", model:"PRX 40mm", mechanism:"Cuarzo", condition:"Buena", purchase_price:151.95, purchase_date:"2026-04-05", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:240.0, sale_channel:"Catawiki", sale_price:240.0, sale_shipping:60.0, sale_date:"2026-04-18", customer_name:"André Bernardino", customer_country:"PT", factura_estado:"PDF pendiente" },
  { id:"w026", brand:"Hamilton", model:"Jazzmaster Viewmatic", mechanism:"Automático", condition:"Buena", purchase_price:244.45, purchase_date:"2026-03-29", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:345.0, sale_channel:"Catawiki", sale_price:345.0, sale_shipping:60.0, sale_date:"2026-04-17", customer_name:"Ricardo Brandão", customer_country:"PT", factura_num:"TL-2026-103", factura_estado:"PDF generado" },
  { id:"w027", brand:"Longines", model:"Flagship", mechanism:"Cuerda", condition:"Buena", purchase_price:321.15, purchase_date:"2026-03-15", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:565.0, sale_channel:"Catawiki", sale_price:565.0, sale_shipping:60.0, sale_date:"2026-04-17", customer_name:"Fernando Rosa", customer_country:"PT", factura_num:"TL-2026-104", factura_estado:"PDF generado" },
  { id:"w028", brand:"Longines", model:"Ref. 3402-6 – Cal. 12.68Z", mechanism:"Cuerda", condition:"Buena", purchase_price:267.09, purchase_date:"2026-03-26", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:300.0, sale_channel:"Catawiki", sale_price:300.0, sale_shipping:60.0, sale_date:"2026-04-17", customer_name:"Marco Vallone", factura_num:"TL-2026-105", factura_estado:"PDF generado" },
  { id:"w029", brand:"Tissot", model:"Chrono XL", mechanism:"Cuarzo", condition:"Buena", purchase_price:153.98, purchase_date:"2026-03-25", purchase_source:"Wallapop", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:161.0, sale_channel:"Catawiki", sale_price:161.0, sale_shipping:30.0, sale_date:"2026-04-17", customer_name:"Daniel Martín", customer_country:"ES", factura_estado:"PDF pendiente" },
  { id:"w024", brand:"Hamilton", model:"Chrono H685820", mechanism:"Cuarzo", condition:"Buena", purchase_price:310.45, purchase_date:"2026-03-26", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:340.0, sale_channel:"Catawiki", sale_price:340.0, sale_shipping:30.0, sale_date:"2026-04-16", customer_name:"jacques royet", customer_country:"FR", factura_num:"TL-2026-101", factura_estado:"PDF generado" },
  { id:"w025", brand:"Tissot", model:"Chrono V8", mechanism:"Cuarzo", condition:"Buena", purchase_price:115.3, purchase_date:"2026-03-26", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:220.0, sale_channel:"Catawiki", sale_price:220.0, sale_shipping:30.0, sale_date:"2026-04-16", customer_name:"Egbert Wagenborg", customer_country:"NL", factura_num:"TL-2026-102", factura_estado:"PDF generado" },
  { id:"w023", brand:"Zodiac", model:"Goldenline", mechanism:"Automático", condition:"Buena", purchase_price:278.84, purchase_date:"2026-02-01", purchase_source:"Vinted", status:"lost", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, flag_perdido:true, listing_channel:"Catawiki", sale_channel:"Catawiki", sale_price:0.0, sale_shipping:0.0, sale_date:"2026-04-15", factura_estado:"PDF pendiente", lost_date:"2026-04-15", lost_reason:"Importado desde Excel" },
  { id:"w022", brand:"Seiko", model:"Presage Cocktail SRPF37J1", mechanism:"Automático", condition:"Buena", purchase_price:225.7, purchase_date:"2026-03-19", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:300.0, sale_channel:"Catawiki", sale_price:300.0, sale_shipping:50.0, sale_date:"2026-04-13", customer_name:"Théo Aubert", customer_country:"FR", factura_num:"TL-2026-100", factura_estado:"PDF generado" },
  { id:"w020", brand:"Hamilton", model:"Khaki", mechanism:"Cuarzo", condition:"Buena", purchase_price:278.95, purchase_date:"2026-03-26", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:395.0, sale_channel:"Catawiki", sale_price:395.0, sale_shipping:60.0, sale_date:"2026-04-12", customer_name:"Laszlo Toth", customer_country:"HU", factura_num:"TL-2026-098", factura_estado:"PDF generado" },
  { id:"w021", brand:"Hamilton", model:"Khaki Field", mechanism:"Cuarzo", condition:"Buena", purchase_price:191.19, purchase_date:"2026-03-29", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:330.0, sale_channel:"Catawiki", sale_price:330.0, sale_shipping:60.0, sale_date:"2026-04-12", customer_name:"Zsolt Juhász", customer_country:"HU", factura_num:"TL-2026-099", factura_estado:"PDF generado" },
  { id:"w018", brand:"Cauny", model:"Centenario", mechanism:"Cuerda", condition:"Buena", purchase_price:86.19, purchase_date:"2026-03-27", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:140.0, sale_channel:"Catawiki", sale_price:140.0, sale_shipping:50.0, sale_date:"2026-04-11", customer_name:"Jose Velasco", customer_country:"ES", factura_num:"TL-2026-096", factura_estado:"PDF generado" },
  { id:"w019", brand:"Tissot", model:"T-Race T-048417", mechanism:"Cuarzo", condition:"Buena", purchase_price:126.85, purchase_date:"2026-03-10", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:157.0, sale_channel:"Catawiki", sale_price:157.0, sale_shipping:50.0, sale_date:"2026-04-11", customer_name:"Kamal Mahmoud", customer_country:"ES", factura_num:"TL-2026-097", factura_estado:"PDF generado" },
  { id:"w013", brand:"Longines", model:"Comet", mechanism:"Cuerda", condition:"Buena", purchase_price:262.3, purchase_date:"2026-03-16", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:370.0, sale_channel:"Catawiki", sale_price:370.0, sale_shipping:50.0, sale_date:"2026-04-10", customer_name:"TOMAS SALVA", customer_country:"ES", factura_num:"TL-2026-091", factura_estado:"PDF generado" },
  { id:"w014", brand:"Seiko", model:"Chronograph 100M", mechanism:"Cuarzo", condition:"Buena", purchase_price:76.45, purchase_date:"2026-03-15", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:160.0, sale_channel:"Catawiki", sale_price:160.0, sale_shipping:40.0, sale_date:"2026-04-10", customer_name:"Francisco Sanchez-Maroto", customer_country:"ES", factura_num:"TL-2026-092", factura_estado:"PDF generado" },
  { id:"w015", brand:"Seiko", model:"6G34-00B0", mechanism:"Cuarzo", condition:"Buena", purchase_price:93.95, purchase_date:"2026-03-21", purchase_source:"RealCash", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:130.0, sale_channel:"Catawiki", sale_price:130.0, sale_shipping:50.0, sale_date:"2026-04-10", customer_name:"Cihan Lacin", customer_country:"NL", factura_num:"TL-2026-093", factura_estado:"PDF generado" },
  { id:"w016", brand:"Seiko", model:"Chronograph 100M 7T92", mechanism:"Cuarzo", condition:"Buena", purchase_price:109.65, purchase_date:"2026-03-19", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:380.0, sale_channel:"Catawiki", sale_price:380.0, sale_shipping:50.0, sale_date:"2026-04-10", customer_name:"Fabrizio Rispoli", customer_country:"IT", factura_num:"TL-2026-094", factura_estado:"PDF generado" },
  { id:"w017", brand:"Tissot", model:"Le Locle", mechanism:"Automático", condition:"Buena", purchase_price:265.45, purchase_date:"2026-02-25", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:330.0, sale_channel:"Catawiki", sale_price:330.0, sale_shipping:50.0, sale_date:"2026-04-10", customer_name:"David Attal", customer_country:"FR", factura_num:"TL-2026-095", factura_estado:"PDF generado" },
  { id:"w010", brand:"Seiko", model:"5 6305", mechanism:"Automático", condition:"Buena", purchase_price:12.46, purchase_date:"2025-11-21", purchase_source:"Noza", status:"sold", target_channel:"Vinted", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Vinted", listing_price:70.0, sale_channel:"Vinted", sale_price:70.0, sale_shipping:0.0, sale_date:"2026-04-09", customer_name:"Cliente particular", factura_num:"TL-2026-088", factura_estado:"PDF generado" },
  { id:"w011", brand:"Seiko", model:"Chronograph 100M", mechanism:"Cuarzo", condition:"Buena", purchase_price:104.95, purchase_date:"2026-03-20", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:200.0, sale_channel:"Catawiki", sale_price:200.0, sale_shipping:50.0, sale_date:"2026-04-09", customer_name:"Hanspeter Boege", customer_country:"DE", factura_num:"TL-2026-089", factura_estado:"PDF generado" },
  { id:"w012", brand:"Tissot", model:"Gentleman T127.410.11.041.00 Inox", mechanism:"Cuarzo", condition:"Buena", purchase_price:178.62, purchase_date:"2026-01-28", purchase_source:"TicDistribution", status:"sold", target_channel:"Catawiki", regimen_iva:"GENERAL", flag_publicado:true, listing_channel:"Catawiki", listing_price:300.0, sale_channel:"Catawiki", sale_price:300.0, sale_shipping:35.0, sale_date:"2026-04-09", customer_name:"Carlos Cabezas", customer_country:"ES", factura_num:"TL-2026-090", factura_estado:"PDF generado" },
  { id:"w009", brand:"Zenith", model:"Stellina Jumbo", mechanism:"Cuerda", condition:"Buena", purchase_price:220.78, purchase_date:"2026-03-20", purchase_source:"Wallapop", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:375.0, sale_channel:"Catawiki", sale_price:375.0, sale_shipping:0.0, sale_date:"2026-04-08", customer_name:"Daniele Trifance", customer_country:"IT", factura_num:"TL-2026-087", factura_estado:"PDF generado" },
  { id:"w008", brand:"Seiko", model:"Chronograph 4T57", mechanism:"Cuarzo", condition:"Buena", purchase_price:80.95, purchase_date:"2026-03-21", purchase_source:"RealCash", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:97.0, sale_channel:"Catawiki", sale_price:97.0, sale_shipping:60.0, sale_date:"2026-04-07", customer_name:"Miloja Jon", customer_country:"CH", factura_num:"TL-2026-078", factura_estado:"PDF generado" },
  { id:"w007", brand:"Tissot", model:"Le Locle", mechanism:"Automático", condition:"Buena", purchase_price:189.85, purchase_date:"2026-03-13", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:400.0, sale_channel:"Catawiki", sale_price:400.0, sale_shipping:30.0, sale_date:"2026-04-04", customer_name:"Alfosnso Bifulco", customer_country:"FR", factura_num:"TL-2026-086", factura_estado:"PDF generado" },
  { id:"w006", brand:"Longines", model:"Dolcevita", mechanism:"Cuarzo", condition:"Buena", purchase_price:176.9, purchase_date:"2026-02-06", purchase_source:"Cash Converters", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:360.0, sale_channel:"Catawiki", sale_price:360.0, sale_shipping:45.0, sale_date:"2026-04-03", customer_name:"Silvio Bussatori", customer_country:"IT", factura_num:"TL-2026-085", factura_estado:"PDF generado" },
  { id:"w002", brand:"Citizen", model:"Vintage", mechanism:"Cuarzo", condition:"Buena", purchase_price:20.0, purchase_date:"2026-01-25", purchase_source:"Rastro", status:"sold", target_channel:"Vinted", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Vinted", listing_price:35.0, sale_channel:"Vinted", sale_price:35.0, sale_shipping:0.0, sale_date:"2026-04-02", customer_name:"Cliente particular", factura_num:"TL-2026-081", factura_estado:"PDF generado" },
  { id:"w003", brand:"Longines", model:"Flagship 8473-7", mechanism:"Automático", condition:"Buena", purchase_price:195.15, purchase_date:"2026-03-15", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:365.0, sale_channel:"Catawiki", sale_price:365.0, sale_shipping:50.0, sale_date:"2026-04-02", customer_name:"Fabian Bravo", customer_country:"NL", factura_num:"TL-2026-082", factura_estado:"PDF generado" },
  { id:"w004", brand:"Tissot", model:"PRX Caucho", mechanism:"Cuarzo", condition:"Buena", purchase_price:143.12, purchase_date:"2026-01-28", purchase_source:"TicDistribution", status:"sold", target_channel:"Chrono24", regimen_iva:"GENERAL", flag_publicado:true, listing_channel:"Chrono24", listing_price:250.0, sale_channel:"Chrono24", sale_price:250.0, sale_shipping:15.0, sale_date:"2026-04-02", customer_name:"Martin Eckhoff", customer_country:"DE", factura_num:"TL-2026-083", factura_estado:"PDF generado" },
  { id:"w005", brand:"Tissot", model:"F1", mechanism:"Cuarzo", condition:"Buena", purchase_price:150.35, purchase_date:"2026-03-15", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:340.0, sale_channel:"Catawiki", sale_price:340.0, sale_shipping:40.0, sale_date:"2026-04-02", customer_name:"Dalia Lima", customer_country:"FR", factura_num:"TL-2026-084", factura_estado:"PDF generado" },
  { id:"w000", brand:"Tissot", model:"Chronograph Sport", mechanism:"Cuarzo", condition:"Buena", purchase_price:114.67, purchase_date:"2026-02-11", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:312.0, sale_channel:"Catawiki", sale_price:312.0, sale_shipping:40.0, sale_date:"2026-04-01", customer_name:"ALAIN BARRE", customer_country:"FR", factura_num:"TL-2026-079", factura_estado:"PDF generado" },
  { id:"w001", brand:"Zenith", model:"Calatrava", mechanism:"Cuerda", condition:"Buena", purchase_price:204.55, purchase_date:"2026-03-15", purchase_source:"Vinted", status:"sold", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki", listing_price:286.0, sale_channel:"Catawiki", sale_price:286.0, sale_shipping:50.0, sale_date:"2026-04-01", customer_name:"Vinay Prabhakar Madhusudanan Nair", customer_country:"NL", factura_num:"TL-2026-080", factura_estado:"PDF generado" },
  { id:"w040", brand:"Longines", model:"Conquest Perpetual VHP", mechanism:"Cuarzo", condition:"Buena", purchase_price:92.0, purchase_date:"2026-03-22", purchase_source:"TodoColección", status:"returned", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, flag_devuelto:true, listing_channel:"Catawiki", listing_price:182.0, sale_channel:"Catawiki", sale_price:182.0, sale_shipping:50.0, customer_name:"Gerald Tittel", customer_country:"DE", factura_estado:"PDF pendiente", return_reason:"Importado desde Excel" },
  { id:"w089", brand:"Longines", model:"L890.1", mechanism:"Automático", condition:"Buena", purchase_price:246.59, purchase_date:"2026-04-21", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w090", brand:"Tissot", model:"PRX Chronograph", mechanism:"Cuarzo", condition:"Buena", purchase_price:112.13, purchase_date:"2026-04-21", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w091", brand:"Omega", model:"De Ville", mechanism:"Automático", condition:"Buena", purchase_price:361.69, purchase_date:"2026-04-21", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w075", brand:"Seiko", model:"Chrono 7T92", mechanism:"Cuarzo", condition:"Buena", purchase_price:92.2, purchase_date:"2026-04-16", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w076", brand:"Seiko", model:"Chrono 8T63", mechanism:"Cuarzo", condition:"Buena", purchase_price:98.95, purchase_date:"2026-04-16", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w077", brand:"Seiko", model:"Chrono 7T42", mechanism:"Cuarzo", condition:"Buena", purchase_price:51.21, purchase_date:"2026-04-16", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w078", brand:"Tissot", model:"T-Classic Dream", mechanism:"Cuarzo", condition:"Buena", purchase_price:94.45, purchase_date:"2026-04-16", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w079", brand:"Tissot", model:"Diver Chronograph", mechanism:"Cuarzo", condition:"Buena", purchase_price:93.78, purchase_date:"2026-04-16", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w080", brand:"Omega", model:"De Ville", mechanism:"Cuerda", condition:"Buena", purchase_price:220.45, purchase_date:"2026-04-16", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w081", brand:"Omega", model:"Cocktail Tank", mechanism:"Cuerda", condition:"Buena", purchase_price:120.98, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Vinted", regimen_iva:"REBU" },
  { id:"w082", brand:"Certina", model:"Classic Dress", mechanism:"Cuerda", condition:"Buena", purchase_price:85.4, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w083", brand:"Roamer", model:"Vanguard 315", mechanism:"Automático", condition:"Buena", purchase_price:85.4, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w084", brand:"Edox", model:"Automatique Date", mechanism:"Automático", condition:"Buena", purchase_price:64.05, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w085", brand:"Gibella", model:"Seatime 20ATM", mechanism:"Automático", condition:"Buena", purchase_price:60.49, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Vinted", regimen_iva:"REBU" },
  { id:"w086", brand:"Orion", model:"Art Deco", mechanism:"Cuerda", condition:"Buena", purchase_price:56.93, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Vinted", regimen_iva:"REBU" },
  { id:"w087", brand:"Avia", model:"Avia-matic Date", mechanism:"Automático", condition:"Buena", purchase_price:53.37, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Vinted", regimen_iva:"REBU" },
  { id:"w088", brand:"Fantôme", model:"Automatic 25 jewels", mechanism:"Automático", condition:"Buena", purchase_price:53.37, purchase_date:"2026-04-16", purchase_source:"Vinted", status:"stock", target_channel:"Vinted", regimen_iva:"REBU" },
  { id:"w069", brand:"Rado", model:"Jubilé", mechanism:"Cuarzo", condition:"Buena", purchase_price:120.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w070", brand:"Oris", model:"Sport Date", mechanism:"Cuerda", condition:"Buena", purchase_price:150.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w071", brand:"Omega", model:"Seamaster Lady", mechanism:"Automático", condition:"Buena", purchase_price:325.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w072", brand:"Maurice Lacroix", model:"", mechanism:"Cuarzo", condition:"Buena", purchase_price:40.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w073", brand:"Certina", model:"Tank", mechanism:"Cuerda", condition:"Buena", purchase_price:40.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w074", brand:"Omega", model:"Geneve Vintage", mechanism:"Automático", condition:"Buena", purchase_price:400.0, purchase_date:"2026-04-12", purchase_source:"Rastro", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w065", brand:"Zenith", model:"Vintage", mechanism:"Cuerda", condition:"Buena", purchase_price:152.05, purchase_date:"2026-04-11", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w066", brand:"Tissot", model:"T-Lord", mechanism:"Automático", condition:"Buena", purchase_price:184.65, purchase_date:"2026-04-11", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w067", brand:"Tissot", model:"Seastar Seven", mechanism:"Automático", condition:"Buena", purchase_price:136.3, purchase_date:"2026-04-11", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w068", brand:"Baume & Mercier", model:"Classima", mechanism:"Cuarzo", condition:"Buena", purchase_price:305.4, purchase_date:"2026-04-11", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w064", brand:"Tissot", model:"Le Locle", mechanism:"Automático", condition:"Buena", purchase_price:225.55, purchase_date:"2026-04-10", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w042", brand:"Baume & Mercier", model:"Chronograph Landeron", mechanism:"Cuerda", condition:"Buena", purchase_price:530.09, purchase_date:"2026-04-08", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w056", brand:"Seiko", model:"Seiko 5 SNK357K1", mechanism:"Automático", condition:"Buena", purchase_price:94.34, purchase_date:"2026-04-08", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w046", brand:"Hamilton", model:"Khaki Diver Sub. 660ft", mechanism:"Cuarzo", condition:"Buena", purchase_price:163.08, purchase_date:"2026-04-05", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w057", brand:"Tissot", model:"Seastar 30mm", mechanism:"Automático", condition:"Buena", purchase_price:126.95, purchase_date:"2026-04-05", purchase_source:"Cash Converters", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w058", brand:"Tissot", model:"PR100", mechanism:"Cuarzo", condition:"Buena", purchase_price:107.95, purchase_date:"2026-04-05", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w063", brand:"Tissot", model:"Everytime Gent", mechanism:"Cuarzo", condition:"Buena", purchase_price:84.28, purchase_date:"2026-04-03", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w041", brand:"Baume & Mercier", model:"Geneve", mechanism:"Cuerda", condition:"Buena", purchase_price:200.0, purchase_date:"2026-03-31", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w043", brand:"Cauny", model:"Prima", mechanism:"Cuerda", condition:"Buena", purchase_price:54.69, purchase_date:"2026-03-31", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w062", brand:"Tissot", model:"V8", mechanism:"Cuarzo", condition:"Buena", purchase_price:153.15, purchase_date:"2026-03-28", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w048", brand:"Junghans", model:"Trilastic", mechanism:"Cuerda", condition:"Buena", purchase_price:168.9, purchase_date:"2026-03-27", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w061", brand:"Tissot", model:"Chrono XL", mechanism:"Cuarzo", condition:"Buena", purchase_price:164.73, purchase_date:"2026-03-27", purchase_source:"Wallapop", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w050", brand:"Maurice Lacroix", model:"82188 18K 200M", mechanism:"Cuarzo", condition:"Buena", purchase_price:105.95, purchase_date:"2026-03-21", purchase_source:"RealCash", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w055", brand:"Seiko", model:"5 GMT", mechanism:"Automático", condition:"Buena", purchase_price:255.95, purchase_date:"2026-03-21", purchase_source:"RealCash", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w049", brand:"Longines", model:"Calatrava", mechanism:"Cuerda", condition:"Buena", purchase_price:335.8, purchase_date:"2026-03-19", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w054", brand:"Seiko", model:"Chronograph 100M", mechanism:"Cuarzo", condition:"Buena", purchase_price:98.95, purchase_date:"2026-03-19", purchase_source:"Cash Converters", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w060", brand:"Tissot", model:"Seastar", mechanism:"Automático", condition:"Buena", purchase_price:163.65, purchase_date:"2026-03-15", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w059", brand:"Tissot", model:"Seastar", mechanism:"Cuerda", condition:"Buena", purchase_price:49.9, purchase_date:"2026-03-13", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w053", brand:"Seiko", model:"Presage Openheart", mechanism:"Automático", condition:"Buena", purchase_price:236.05, purchase_date:"2026-02-20", purchase_source:"Vinted", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
  { id:"w044", brand:"Citizen", model:"Vintage", mechanism:"Cuarzo", condition:"Buena", purchase_price:20.0, purchase_date:"2026-01-25", purchase_source:"Rastro", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w047", brand:"Junghans", model:"Vintage", mechanism:"Cuerda", condition:"Buena", purchase_price:34.79, purchase_date:"2026-01-11", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w045", brand:"Favre-Leyva", model:"Sea Chief", mechanism:"Cuerda", condition:"Buena", purchase_price:64.48, purchase_date:"2026-01-06", purchase_source:"Shah Zaib", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w051", brand:"Orient", model:"King Diver", mechanism:"Automático", year:"Decada 1980", condition:"Buena", purchase_price:99.09, purchase_date:"2025-12-05", purchase_source:"Vinted", status:"listed", target_channel:"Catawiki", regimen_iva:"REBU", flag_publicado:true, listing_channel:"Catawiki" },
  { id:"w052", brand:"Seiko", model:"Seiko 5 / 4206", mechanism:"Automático", condition:"Buena", purchase_price:12.46, purchase_date:"2025-11-21", purchase_source:"Noza", status:"stock", target_channel:"Catawiki", regimen_iva:"REBU" },
];

const SEED_OPPORTUNITIES = [
  { id: "op001", brand: "Omega", model: "Seamaster 300", ask_price: 1200, est_hammer: 1600, channel: "Catawiki", red_flags: [], source: "Wallapop", created_date: "2026-04-20", decision: "pending", notes: "Ref 2531.80, escrutar autenticidad" },
  { id: "op002", brand: "Tudor", model: "Black Bay 58", ask_price: 2500, est_hammer: 3100, channel: "Chrono24", red_flags: [], source: "Vinted", created_date: "2026-04-19", decision: "pending", notes: "Completo con caja y papeles" },
];

const SEED_PRICE_COMPS = [
  { brand:"Seiko", model:"SQ 5Y23", price:67.0, channel:"Catawiki", date:"2026-04-22", source:"hammer" },
  { brand:"Tissot", model:"Chrono XL", price:195.0, channel:"Catawiki", date:"2026-04-22", source:"hammer" },
  { brand:"Seiko", model:"Chronograph", price:210.0, channel:"Catawiki", date:"2026-04-21", source:"hammer" },
  { brand:"Tissot", model:"T-Classic Everytime", price:100.0, channel:"Catawiki", date:"2026-04-21", source:"hammer" },
  { brand:"Thermidor", model:"De Luxe", price:100.0, channel:"Catawiki", date:"2026-04-21", source:"hammer" },
  { brand:"Tissot", model:"PR100", price:150.0, channel:"Catawiki", date:"2026-04-20", source:"hammer" },
  { brand:"Omega", model:"Electronic f300 Hz Chronometer", price:600.0, channel:"Catawiki", date:"2026-04-19", source:"hammer" },
  { brand:"Seiko", model:"7S26 Arabic Dial", price:180.0, channel:"Catawiki", date:"2026-04-19", source:"hammer" },
  { brand:"Fortis", model:"Vintage Art Deco NOS", price:114.0, channel:"Catawiki", date:"2026-04-18", source:"hammer" },
  { brand:"Tissot", model:"PRX 40mm", price:240.0, channel:"Catawiki", date:"2026-04-18", source:"hammer" },
  { brand:"Hamilton", model:"Jazzmaster Viewmatic", price:345.0, channel:"Catawiki", date:"2026-04-17", source:"hammer" },
  { brand:"Longines", model:"Flagship", price:565.0, channel:"Catawiki", date:"2026-04-17", source:"hammer" },
  { brand:"Longines", model:"Ref. 3402-6 – Cal. 12.68Z", price:300.0, channel:"Catawiki", date:"2026-04-17", source:"hammer" },
  { brand:"Tissot", model:"Chrono XL", price:161.0, channel:"Catawiki", date:"2026-04-17", source:"hammer" },
  { brand:"Hamilton", model:"Chrono H685820", price:340.0, channel:"Catawiki", date:"2026-04-16", source:"hammer" },
  { brand:"Tissot", model:"Chrono V8", price:220.0, channel:"Catawiki", date:"2026-04-16", source:"hammer" },
  { brand:"Seiko", model:"Presage Cocktail SRPF37J1", price:300.0, channel:"Catawiki", date:"2026-04-13", source:"hammer" },
  { brand:"Hamilton", model:"Khaki", price:395.0, channel:"Catawiki", date:"2026-04-12", source:"hammer" },
  { brand:"Hamilton", model:"Khaki Field", price:330.0, channel:"Catawiki", date:"2026-04-12", source:"hammer" },
  { brand:"Cauny", model:"Centenario", price:140.0, channel:"Catawiki", date:"2026-04-11", source:"hammer" },
  { brand:"Tissot", model:"T-Race T-048417", price:157.0, channel:"Catawiki", date:"2026-04-11", source:"hammer" },
  { brand:"Longines", model:"Comet", price:370.0, channel:"Catawiki", date:"2026-04-10", source:"hammer" },
  { brand:"Seiko", model:"Chronograph 100M", price:160.0, channel:"Catawiki", date:"2026-04-10", source:"hammer" },
  { brand:"Seiko", model:"6G34-00B0", price:130.0, channel:"Catawiki", date:"2026-04-10", source:"hammer" },
  { brand:"Seiko", model:"Chronograph 100M 7T92", price:380.0, channel:"Catawiki", date:"2026-04-10", source:"hammer" },
  { brand:"Tissot", model:"Le Locle", price:330.0, channel:"Catawiki", date:"2026-04-10", source:"hammer" },
  { brand:"Seiko", model:"5 6305", price:70.0, channel:"Vinted", date:"2026-04-09", source:"hammer" },
  { brand:"Seiko", model:"Chronograph 100M", price:200.0, channel:"Catawiki", date:"2026-04-09", source:"hammer" },
  { brand:"Tissot", model:"Gentleman T127.410.11.041.00 Inox", price:300.0, channel:"Catawiki", date:"2026-04-09", source:"hammer" },
  { brand:"Zenith", model:"Stellina Jumbo", price:375.0, channel:"Catawiki", date:"2026-04-08", source:"hammer" },
  { brand:"Seiko", model:"Chronograph 4T57", price:97.0, channel:"Catawiki", date:"2026-04-07", source:"hammer" },
  { brand:"Tissot", model:"Le Locle", price:400.0, channel:"Catawiki", date:"2026-04-04", source:"hammer" },
  { brand:"Longines", model:"Dolcevita", price:360.0, channel:"Catawiki", date:"2026-04-03", source:"hammer" },
  { brand:"Citizen", model:"Vintage", price:35.0, channel:"Vinted", date:"2026-04-02", source:"hammer" },
  { brand:"Longines", model:"Flagship 8473-7", price:365.0, channel:"Catawiki", date:"2026-04-02", source:"hammer" },
  { brand:"Tissot", model:"PRX Caucho", price:250.0, channel:"Chrono24", date:"2026-04-02", source:"hammer" },
  { brand:"Tissot", model:"F1", price:340.0, channel:"Catawiki", date:"2026-04-02", source:"hammer" },
  { brand:"Tissot", model:"Chronograph Sport", price:312.0, channel:"Catawiki", date:"2026-04-01", source:"hammer" },
  { brand:"Zenith", model:"Calatrava", price:286.0, channel:"Catawiki", date:"2026-04-01", source:"hammer" },
];

const SEED_EXPENSES = [
  { date:"2026-04-21", concept:"Etiqueta devolución Longines Perpetual", provider:"UPS", base:14.34, iva:0, total:0, deducible:false },
  { date:"2026-04-14", concept:"Devolución parcial Citizen Marinaut", provider:"N26", base:5.0, iva:0.0, total:0.0, deducible:true },
  { date:"2026-04-13", concept:"Claude Plan MAX", provider:"Anthropic", base:72.53, iva:0.0, total:72.53, deducible:true },
  { date:"2026-04-12", concept:"Claude Plan PRO", provider:"Anthropic", base:18.0, iva:0.0, total:18.0, deducible:true },
  { date:"2026-04-12", concept:"Parking Casino de la Reina (Rastro)", provider:"Aparcamientos y Servicios S.A.", base:5.45, iva:1.15, total:6.6, deducible:true },
  { date:"2026-04-10", concept:"Reparación Favre-Leuba", provider:"Time Repair", base:28.93, iva:6.07, total:35.0, deducible:true },
  { date:"2026-04-09", concept:"Etiqueta envio Longines Perpetual", provider:"Correos", base:6.61, iva:1.39, total:8.0, deducible:true },
  { date:"2026-04-06", concept:"Creador de logos", provider:"Rebrand", base:6.6, iva:1.39, total:7.99, deducible:true },
  { date:"2026-04-05", concept:"ChatGPT Plus", provider:"OpenAI", base:19.0, iva:3.99, total:22.99, deducible:true },
  { date:"2026-04-05", concept:"Parking Lavapiés (Rastro)", provider:"Bolton Park SL", base:5.87, iva:1.23, total:7.1, deducible:true },
  { date:"2026-04-04", concept:"Seguro Tissot Le Locle", provider:"Correos", base:3.65, iva:0.0, total:3.65, deducible:true },
  { date:"2026-04-04", concept:"Seguro Tissot F1", provider:"Correos", base:3.25, iva:0.0, total:3.25, deducible:true },
  { date:"2026-04-04", concept:"Seguro Longines Flagship Automatic", provider:"Correos", base:3.55, iva:0.0, total:3.55, deducible:true },
  { date:"2026-04-03", concept:"Seguro Tissot Chrono G10 Titanium", provider:"Correos", base:3.0, iva:0.0, total:3.0, deducible:true },
  { date:"2026-04-03", concept:"Seguro Longines Dolcevita", provider:"Correos", base:3.5, iva:0.0, total:3.5, deducible:true },
];

const DEFAULT_SETTINGS = {
  iva_rate: 21,
  irpf_rate: 22,
  catawiki_commission: 12.5,
  chrono24_commission: 6.5,
  vinted_commission: 5,
  target_roi_min: 25,
  target_profit_min: 120,
  target_ticket: 180,
  envio_medio: 13,
  envio_cobrado_medio: 50,
  fiscal_regime: "autonomo_rebu", // autonomo_rebu | autonomo_general | sl_rebu | sl_general
  aged_threshold_soft: 30,
  aged_threshold_hard: 45,
  aged_threshold_critical: 60,
  auto_price_drop_soft: 10, // % bajada sugerida a los 30d
  auto_price_drop_hard: 15, // % bajada sugerida a los 45d
  q1_baseline: { ops: 77, revenue: 16951, profit: 5918, roi: 79, avg_profit: 85, ticket_purchase: 122, ticket_sale: 220, days_to_sell: 17 },
};

// ═══════════════════════════════════════════════════════════
// EVENT TYPES & HELPERS
// ═══════════════════════════════════════════════════════════
const EVENT_TYPES = {
  purchased:    { label: "Comprado",      color: "#B87333" },
  listed:       { label: "Publicado",     color: "#8BA8B7" },
  price_change: { label: "Cambio precio", color: "#E8B04B" },
  sold:         { label: "Vendido",       color: "#7FB069" },
  returned:     { label: "Devuelto",      color: "#D4564D" },
  refunded:     { label: "Reembolso",     color: "#D4564D" },
  note:         { label: "Nota",          color: "#A89278" },
  photo:        { label: "Foto añadida",  color: "#C9A961" },
  contact:      { label: "Contacto",      color: "#8BA8B7" },
};

// Derive events from watch data + custom events array
const deriveEvents = (watch) => {
  const events = [];
  if (watch.purchase_date) {
    events.push({
      type: "purchased", date: watch.purchase_date,
      note: `€${watch.purchase_price} desde ${watch.purchase_source}`,
    });
  }
  if (watch.listing_date) {
    events.push({
      type: "listed", date: watch.listing_date,
      note: `${watch.listing_channel} @ €${watch.listing_price || "?"}`,
    });
  }
  if (watch.price_changes) {
    watch.price_changes.forEach(pc => {
      events.push({ type: "price_change", date: pc.date, note: `De €${pc.from} a €${pc.to}` });
    });
  }
  if (watch.status === "sold" && watch.sale_date) {
    events.push({
      type: "sold", date: watch.sale_date,
      note: `€${watch.sale_price} a ${watch.customer_name || "cliente"}`,
    });
  }
  if (watch.returned_date) {
    events.push({
      type: "returned", date: watch.returned_date,
      note: watch.return_reason || "Sin motivo",
    });
  }
  // Merge user-added events
  (watch.events || []).forEach(e => events.push(e));
  return events.sort((a, b) => b.date.localeCompare(a.date));
};

// REBU VAT calculator — margin-only taxation
const calcRebuVat = (sale_price, purchase_price, iva_rate = 21) => {
  if (sale_price <= purchase_price) return 0;
  const margin = sale_price - purchase_price;
  return margin * iva_rate / (100 + iva_rate);
};

// Time-to-sell prediction from historical data
const predictTimeToSell = (watch, watches) => {
  const sold = watches.filter(w => w.status === "sold" && w.purchase_date && w.sale_date);
  if (sold.length < 5) return null;
  const sameBrand = sold.filter(w => w.brand === watch.brand);
  const sample = sameBrand.length >= 3 ? sameBrand : sold;
  const days = sample.map(w => daysBetween(w.purchase_date, w.sale_date)).sort((a, b) => a - b);
  const median = days[Math.floor(days.length / 2)];
  const p25 = days[Math.floor(days.length * 0.25)];
  const p75 = days[Math.floor(days.length * 0.75)];
  return {
    median, p25, p75,
    sample_size: sample.length,
    scope: sameBrand.length >= 3 ? watch.brand : "global",
  };
};

// Suggestions engine — proactive CRM actions
const getSuggestions = (watch, settings, watches) => {
  const suggestions = [];
  if (watch.status === "stock") {
    const days = daysBetween(watch.purchase_date, today());
    if (days > settings.aged_threshold_critical) {
      suggestions.push({
        priority: "high", icon: "alert",
        text: "Liquidar en Vinted con precio simbólico o armar lote",
        action: "move_vinted",
      });
    } else if (days > settings.aged_threshold_hard) {
      suggestions.push({
        priority: "high", icon: "trending-down",
        text: `Bajar precio -${settings.auto_price_drop_hard}% o cambiar de canal`,
        action: "price_drop_hard",
      });
    } else if (days > settings.aged_threshold_soft) {
      suggestions.push({
        priority: "med", icon: "trending-down",
        text: `Considerar bajada -${settings.auto_price_drop_soft}% o relistar`,
        action: "price_drop_soft",
      });
    }
    if (!watch.listing_date && days > 3) {
      suggestions.push({
        priority: "med", icon: "tag",
        text: "Reloj aún sin publicar, crea listing",
        action: "create_listing",
      });
    }
  }
  if (watch.status === "listed" && watch.listing_date) {
    const days = daysBetween(watch.listing_date, today());
    if (days > 14) {
      suggestions.push({
        priority: "med", icon: "trending-down",
        text: "Listado 2+ semanas sin venta, ajustar precio",
        action: "price_drop_listed",
      });
    }
  }
  if (watch.status === "sold" && watch.factura_estado === "PDF pendiente") {
    suggestions.push({
      priority: "high", icon: "file",
      text: "Factura pendiente de generar",
      action: "generate_invoice",
    });
  }
  return suggestions;
};

// Photo storage helpers — hybrid: localStorage for instant access, Drive for sync
// When Apps Script is configured, photos are uploaded to Drive lazily in background
// and the `url` field is added to each photo. Display logic prefers url over data.
const photoKey = (watchId) => `timelab:photos:${watchId}`;

const loadPhotos = async (watchId) => {
  const key = photoKey(watchId);
  try {
    const res = await window.storage.get(key);
    if (!res || !res.value) return [];
    const parsed = JSON.parse(res.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    if (e && e.message && !e.message.toLowerCase().includes("not found") && !e.message.toLowerCase().includes("no such")) {
      console.warn(`[loadPhotos ${key}]`, e);
    }
    return [];
  }
};

const savePhotos = async (watchId, photos) => {
  const key = photoKey(watchId);
  try {
    if (!photos || photos.length === 0) {
      await window.storage.delete(key);
      return { ok: true, count: 0 };
    }
    const payload = JSON.stringify(photos);
    if (payload.length > 4.8 * 1024 * 1024) {
      console.error(`[savePhotos ${key}] Payload too large: ${(payload.length/1024/1024).toFixed(2)}MB`);
      return { ok: false, error: "payload_too_large", size: payload.length };
    }
    const res = await window.storage.set(key, payload);
    if (!res) {
      console.error(`[savePhotos ${key}] set() returned null — storage failed`);
      return { ok: false, error: "storage_returned_null" };
    }
    return { ok: true, count: photos.length, size: payload.length };
  } catch (e) {
    console.error(`[savePhotos ${key}]`, e);
    return { ok: false, error: e?.message || "unknown" };
  }
};

// Lazy photo upload: fire-and-forget, adds url field when done
const syncPhotoToCloud = async (watchId, photo) => {
  const { url } = getGasConfig();
  if (!url) return null; // no sync configured
  if (photo.url) return photo.url; // already synced
  try {
    const cloudUrl = await uploadPhotoToGas(watchId, photo.id, photo.data);
    if (cloudUrl) {
      // Update stored photo with URL
      const photos = await loadPhotos(watchId);
      const updated = photos.map(p => p.id === photo.id ? { ...p, url: cloudUrl } : p);
      await savePhotos(watchId, updated);
      return cloudUrl;
    }
  } catch (e) {
    console.warn("[syncPhotoToCloud] queuing for retry:", e.message);
    queueOp({ type: "photo_upload", watchId, photoId: photo.id, dataUrl: photo.data });
  }
  return null;
};

const listPhotoKeys = async () => {
  try {
    const res = await window.storage.list("timelab:photos:");
    return res?.keys || [];
  } catch (e) {
    console.warn("[listPhotoKeys]", e);
    return [];
  }
};

const resizeImage = (file, maxDim = 800, quality = 0.7) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
const daysBetween = (d1, d2) => {
  const a = new Date(d1), b = new Date(d2);
  return Math.floor((b - a) / 86400000);
};
const today = () => new Date().toISOString().split("T")[0];
const euro = (n) => `€${(n ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const euroExact = (n) => `€${(n ?? 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n) => `${((n ?? 0) * 100).toFixed(1)}%`;
const uid = () => "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Age classification for stock
const ageClass = (days) => {
  if (days > 60) return { label: "AÑEJO", color: C.ruby, bg: "#2A1816", emoji: "🔴" };
  if (days > 45) return { label: "ALERTA", color: C.amber, bg: "#2A2216", emoji: "🟡" };
  if (days > 30) return { label: "ATENCIÓN", color: C.amber, bg: "#2A2216", emoji: "🟡" };
  if (days > 15) return { label: "NORMAL", color: C.dim, bg: "#1F1A13", emoji: "⚪" };
  return { label: "FRESCO", color: C.jade, bg: "#182216", emoji: "🟢" };
};

// Score calculation for opportunities
const scoreOpportunity = (opp, settings) => {
  const { ask_price, est_hammer, channel, red_flags } = opp;
  const commission = channel === "Catawiki" ? settings.catawiki_commission
                   : channel === "Chrono24" ? settings.chrono24_commission
                   : channel === "Vinted" ? settings.vinted_commission : 0;
  const net_sale = est_hammer * (1 - commission / 100);
  const shipping_profit = settings.envio_cobrado_medio - settings.envio_medio;
  const profit = net_sale + shipping_profit - ask_price;
  const roi = profit / ask_price;
  const flag_penalty = (red_flags || []).length;

  let verdict = "PASS";
  let color = C.ruby;
  if (profit >= settings.target_profit_min && roi * 100 >= settings.target_roi_min && flag_penalty === 0) {
    verdict = "GO"; color = C.jade;
  } else if (profit >= settings.target_profit_min * 0.7 && roi * 100 >= settings.target_roi_min * 0.7 && flag_penalty <= 1) {
    verdict = "MAYBE"; color = C.amber;
  }
  return { profit, roi, verdict, color, net_sale };
};

// Listing generator
const generateListing = (watch, channel) => {
  const title_en = `${watch.brand} ${watch.model} ${watch.size || ""} ${watch.mechanism === "Automático" ? "Automatic" : watch.mechanism === "Cuarzo" ? "Quartz" : watch.mechanism === "Cuerda" ? "Manual Wind" : ""} Men's Watch`.replace(/\s+/g, " ").trim();
  const year = watch.year || "Vintage";
  const size = watch.size || "N/A";
  const condition_map = { "NOS": "New Old Stock", "Muy buena": "Excellent", "Buena": "Good", "Regular": "Fair", "Reparado": "Serviced" };
  const cond_en = condition_map[watch.condition] || watch.condition;

  if (channel === "Catawiki") {
    return {
      title: title_en,
      description: `${watch.brand} ${watch.model} — ${year}\n\nMovement: ${watch.mechanism === "Automático" ? "Automatic" : watch.mechanism === "Cuarzo" ? "Quartz" : "Manual wind"}\nCase size: ${size} (crown excluded)\nCondition: ${cond_en}\nOrigin: European private collection\n\nThe watch has been inspected, cleaned and tested. Keeps good time. Shipped fully insured with tracking. 14-day return policy under EU consumer law.\n\n${watch.notes ? "Notes: " + watch.notes : ""}`.trim()
    };
  }
  if (channel === "Vinted") {
    return {
      title: `${watch.brand} ${watch.model} — ${cond_en}`,
      description: `${watch.brand} ${watch.model}\n${year} · ${size} · ${watch.mechanism}\nCondition: ${cond_en}\n\nWorking perfectly. Shipped insured. Fast dispatch.\n\n#${watch.brand.replace(/\s+/g, "")} #${watch.mechanism} #VintageWatch #Mensche`.trim()
    };
  }
  if (channel === "Chrono24") {
    return {
      title: `${watch.brand} ${watch.model} ${year} — ${cond_en}`,
      description: `Beautiful ${watch.brand} ${watch.model} from ${year}.\n\n• Case: ${size} stainless steel (measured without crown)\n• Movement: ${watch.mechanism}\n• Condition: ${cond_en} — recently serviced and inspected\n• Timekeeping: within chronometer spec\n\nProfessionally assessed by a Spanish watch dealer. Full buyer protection through Chrono24 Trusted Checkout. Ships insured worldwide with express tracking.\n\nAuthenticity guaranteed. 14-day return. Invoice provided.`.trim()
    };
  }
  return { title: title_en, description: "" };
};

// ═══════════════════════════════════════════════════════════
// STATE REDUCER
// ═══════════════════════════════════════════════════════════
const initialState = {
  watches: [],
  opportunities: [],
  price_comps: [],
  expenses: [],
  customer_notes: [], // array of {customer_name, date, type, note}
  settings: DEFAULT_SETTINGS,
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD": return { ...state, ...action.payload, loaded: true };
    case "ADD_WATCH": return { ...state, watches: [action.watch, ...state.watches] };
    case "UPDATE_WATCH": return { ...state, watches: state.watches.map(w => w.id === action.watch.id ? action.watch : w) };
    case "DELETE_WATCH": return { ...state, watches: state.watches.filter(w => w.id !== action.id) };
    case "SELL_WATCH": return { ...state, watches: state.watches.map(w => w.id === action.id ? { ...w, ...action.sale, status: "sold", flag_publicado: true } : w) };
    case "LIST_WATCH": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w, status: "listed",
        listing_date: action.listing.listing_date,
        listing_channel: action.listing.listing_channel,
        listing_price: action.listing.listing_price,
        listing_url: action.listing.listing_url,
        flag_publicado: true,
      } : w)
    };
    case "UNLIST_WATCH": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w, status: "stock",
        listing_date: undefined, listing_channel: undefined,
        listing_price: undefined, listing_url: undefined,
        flag_publicado: false,
      } : w)
    };
    case "DROP_PRICE": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w,
        price_changes: [...(w.price_changes || []), { date: today(), from: w.listing_price, to: action.new_price }],
        listing_price: action.new_price,
      } : w)
    };
    case "RETURN_WATCH": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w, status: "returned",
        returned_date: action.returned_date || today(),
        return_reason: action.return_reason,
        flag_devuelto: true,
      } : w)
    };
    case "LOST_WATCH": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w, status: "lost",
        lost_date: action.lost_date || today(),
        lost_reason: action.lost_reason,
        flag_perdido: true,
      } : w)
    };
    case "RELIST_AFTER_RETURN": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w, status: "stock",
        // Keep returned history for the timeline
      } : w)
    };
    case "ADD_WATCH_EVENT": return {
      ...state, watches: state.watches.map(w => w.id === action.id ? {
        ...w, events: [...(w.events || []), action.event],
      } : w)
    };
    case "ADD_CUSTOMER_NOTE": return {
      ...state,
      customer_notes: [action.note, ...state.customer_notes],
    };
    case "DELETE_CUSTOMER_NOTE": return {
      ...state,
      customer_notes: state.customer_notes.filter((_, i) => i !== action.index),
    };
    case "ADD_OPP": return { ...state, opportunities: [action.opp, ...state.opportunities] };
    case "UPDATE_OPP": return { ...state, opportunities: state.opportunities.map(o => o.id === action.opp.id ? action.opp : o) };
    case "DELETE_OPP": return { ...state, opportunities: state.opportunities.filter(o => o.id !== action.id) };
    case "CONVERT_OPP": {
      const { opp, price } = action;
      const newWatch = {
        id: uid(), brand: opp.brand, model: opp.model, mechanism: "Automático", year: "", size: "",
        condition: "Buena", purchase_price: price, purchase_date: today(), purchase_source: opp.source,
        notes: opp.notes, status: "stock", target_channel: opp.channel,
      };
      return {
        ...state,
        watches: [newWatch, ...state.watches],
        opportunities: state.opportunities.map(o => o.id === opp.id ? { ...o, decision: "bought", watch_id: newWatch.id } : o),
      };
    }
    case "ADD_COMP": return { ...state, price_comps: [action.comp, ...state.price_comps] };
    case "ADD_EXPENSE": return { ...state, expenses: [action.expense, ...state.expenses] };
    case "DELETE_EXPENSE": return { ...state, expenses: state.expenses.filter((_, i) => i !== action.index) };
    case "UPDATE_SETTINGS": return { ...state, settings: { ...state.settings, ...action.settings } };
    case "RESET_SEED": return { ...initialState, watches: SEED_WATCHES, opportunities: SEED_OPPORTUNITIES, price_comps: SEED_PRICE_COMPS, expenses: SEED_EXPENSES, customer_notes: [], settings: DEFAULT_SETTINGS, loaded: true };
    default: return state;
  }
}

// ═══════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════
const Shell = ({ children }) => (
  <div className="min-h-screen font-sans" style={{
    background: `radial-gradient(ellipse at top, ${C.coal} 0%, ${C.ink} 60%)`,
    color: C.cream,
    fontFamily: "'Manrope', -apple-system, sans-serif"
  }}>
    {children}
  </div>
);

const Card = ({ children, className = "", style = {} }) => (
  <div className={`rounded-2xl ${className}`} style={{
    background: C.surface,
    border: `1px solid ${C.line}`,
    boxShadow: `inset 0 1px 0 rgba(232,220,196,0.04), 0 4px 16px rgba(0,0,0,0.3)`,
    ...style
  }}>
    {children}
  </div>
);

const Chip = ({ children, color = C.dim, bg }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium tracking-wide" style={{
    color, background: bg || `${color}18`, border: `1px solid ${color}33`
  }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", icon: Icon, full, disabled, className = "" }) => {
  const styles = {
    primary:   { bg: C.gold, fg: C.ink, border: C.gold },
    secondary: { bg: "transparent", fg: C.cream, border: C.line },
    ghost:     { bg: "transparent", fg: C.dim, border: "transparent" },
    danger:    { bg: "transparent", fg: C.ruby, border: `${C.ruby}55` },
    success:   { bg: C.jade, fg: C.ink, border: C.jade },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all active:scale-95 ${full ? "w-full" : ""} ${disabled ? "opacity-40" : "hover:opacity-90"} ${className}`}
      style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}>
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder, options, rows }) => (
  <label className="block">
    <span className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: C.mute }}>{label}</span>
    {options ? (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: C.raised, color: C.cream, border: `1px solid ${C.line}` }}>
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : rows ? (
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
        style={{ background: C.raised, color: C.cream, border: `1px solid ${C.line}` }} />
    ) : (
      <input type={type} value={value ?? ""} onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: C.raised, color: C.cream, border: `1px solid ${C.line}` }} />
    )}
  </label>
);

const StatCard = ({ label, value, sub, trend, icon: Icon, accent = C.gold }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: C.mute }}>{label}</span>
      {Icon && <Icon size={14} style={{ color: accent }} />}
    </div>
    <div className="font-serif text-2xl font-light" style={{ color: C.cream, fontFamily: "'Fraunces', serif" }}>{value}</div>
    {sub && <div className="text-xs mt-1 flex items-center gap-1" style={{ color: trend === "up" ? C.jade : trend === "down" ? C.ruby : C.dim }}>
      {trend === "up" && <ArrowUpRight size={12} />}
      {trend === "down" && <ArrowDownRight size={12} />}
      {sub}
    </div>}
  </Card>
);

// ═══════════════════════════════════════════════════════════
// VIEW: DASHBOARD
// ═══════════════════════════════════════════════════════════
const Dashboard = ({ state, setView, syncStatus }) => {
  const { watches, settings } = state;
  // Stock activo = stock + listed (aún no vendidos y con capital invertido)
  const stock = watches.filter(w => w.status === "stock" || w.status === "listed");
  // Ventas exitosas (excluye devueltos y perdidos)
  const sold = watches.filter(w => w.status === "sold");

  const kpis = useMemo(() => {
    const q2start = "2026-04-01";
    // Only successful sales for revenue/profit metrics
    const soldQ2 = sold.filter(w => w.sale_date >= q2start);
    const lostAll = state.watches.filter(w => w.status === "lost");
    const returnedAll = state.watches.filter(w => w.status === "returned");
    const todayDate = today();
    const daysQ2 = Math.max(1, daysBetween(q2start, todayDate) + 1);
    const revenue = soldQ2.reduce((s, w) => s + (w.sale_price || 0) + (w.sale_shipping || 0), 0);
    const cost = soldQ2.reduce((s, w) => s + (w.purchase_price || 0), 0);
    const commission = soldQ2.reduce((s, w) => {
      const rate = w.sale_channel === "Catawiki" ? settings.catawiki_commission
        : w.sale_channel === "Chrono24" ? settings.chrono24_commission
        : w.sale_channel === "Vinted" ? settings.vinted_commission : 0;
      return s + (w.sale_price || 0) * rate / 100 * 1.21;
    }, 0);
    const shipping = soldQ2.length * settings.envio_medio * 1.21;
    const profit = revenue - cost - commission - shipping;
    const avg_roi = soldQ2.length ? soldQ2.reduce((s, w) => s + ((w.sale_price - w.purchase_price) / w.purchase_price), 0) / soldQ2.length : 0;
    const stock_value = stock.reduce((s, w) => s + (w.purchase_price || 0), 0);
    const aged = stock.filter(w => daysBetween(w.purchase_date, todayDate) > 45);
    const aged_value = aged.reduce((s, w) => s + (w.purchase_price || 0), 0);
    const lost_value = lostAll.reduce((s, w) => s + (w.purchase_price || 0), 0);
    return {
      ops: soldQ2.length,
      pace: soldQ2.length / daysQ2,
      revenue, profit,
      avg_profit: soldQ2.length ? profit / soldQ2.length : 0,
      avg_roi,
      stock_count: stock.length,
      stock_value,
      aged_count: aged.length,
      aged_value,
      lost_count: lostAll.length,
      lost_value,
      returned_count: returnedAll.length,
      days_q2: daysQ2,
    };
  }, [watches, settings, sold, stock, state.watches]);

  const dailySales = useMemo(() => {
    const by = {};
    sold.filter(w => w.sale_date >= "2026-04-01").forEach(w => {
      by[w.sale_date] = (by[w.sale_date] || 0) + 1;
    });
    return Object.entries(by).sort().map(([date, n]) => ({
      date: date.slice(8), ventas: n
    }));
  }, [sold]);

  const brandPerf = useMemo(() => {
    const by = {};
    sold.filter(w => w.sale_date >= "2026-04-01").forEach(w => {
      if (!by[w.brand]) by[w.brand] = { brand: w.brand, ops: 0, profit: 0 };
      by[w.brand].ops++;
      by[w.brand].profit += ((w.sale_price || 0) * 0.85 + 35 - (w.purchase_price || 0));
    });
    return Object.values(by).sort((a, b) => b.profit - a.profit).slice(0, 5);
  }, [sold]);

  const alerts = [];
  stock.forEach(w => {
    const d = daysBetween(w.purchase_date, today());
    if (d > 60) alerts.push({ severity: "high", msg: `${w.brand} ${w.model} — ${d}d en stock (${euro(w.purchase_price)})`, id: w.id });
    else if (d > 45) alerts.push({ severity: "med", msg: `${w.brand} ${w.model} — ${d}d (${euro(w.purchase_price)})`, id: w.id });
  });
  watches.filter(w => w.status === "sold" && w.factura_estado === "PDF pendiente").forEach(w => {
    alerts.push({ severity: "high", msg: `Factura pendiente: ${w.factura_num || "sin nº"} · ${w.brand}`, id: w.id });
  });

  return (
    <div className="px-4 pb-24 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between pt-2">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.mute }}>Timelab Atelier</div>
          <h1 className="font-serif text-3xl mt-1" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300, letterSpacing: "-0.02em" }}>Cuadro de mando</h1>
          <div className="text-xs mt-1" style={{ color: C.dim }}>2T 2026 · Día {kpis.days_q2} de 91</div>
        </div>
        <button onClick={() => setView({ name: "settings" })} className="w-14 h-14 rounded-full flex items-center justify-center relative" style={{
          background: `radial-gradient(circle, ${C.gold}22 0%, transparent 70%)`,
          border: `1px solid ${C.gold}55`
        }}>
          <Watch size={22} style={{ color: C.gold }} />
          {syncStatus && getGasConfig().url && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{
              background: C.coal,
              border: `1px solid ${C.line}`,
            }}>
              {syncStatus.status === "syncing"
                ? <Loader2 size={10} className="animate-spin" style={{ color: C.amber }} />
                : syncStatus.status === "error"
                ? <CloudOff size={10} style={{ color: C.ruby }} />
                : <Cloud size={10} style={{ color: C.jade }} />}
            </div>
          )}
        </button>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ventas 2T" value={kpis.ops} sub={`${kpis.pace.toFixed(2)} ops/día`} trend="up" icon={ShoppingBag} accent={C.jade} />
        <StatCard label="Beneficio" value={euro(kpis.profit)} sub={`${euro(kpis.avg_profit)}/op`} icon={TrendingUp} accent={C.gold} />
        <StatCard label="Facturación" value={euro(kpis.revenue)} sub={`ROI medio ${pct(kpis.avg_roi)}`} icon={Euro} accent={C.cream} />
        <StatCard label="Stock" value={kpis.stock_count} sub={euro(kpis.stock_value)} icon={Package} accent={C.copper} />
      </div>

      {/* Expenses quick access */}
      {(state.expenses || []).length > 0 && (
        <button onClick={() => setView({ name: "expenses" })} className="w-full text-left">
          <Card className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                background: `${C.ruby}15`, border: `1px solid ${C.ruby}33`
              }}>
                <FileText size={16} style={{ color: C.ruby }} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] tracking-widest uppercase font-bold" style={{ color: C.mute }}>Gastos generales 2T</div>
                <div className="font-serif text-base" style={{ color: C.cream, fontFamily: "'Fraunces', serif" }}>{euroExact(state.expenses.reduce((s, e) => s + (e.total || 0), 0))}</div>
                <div className="text-xs mt-0.5" style={{ color: C.dim }}>{state.expenses.length} apuntes · IVA soportado {euroExact(state.expenses.reduce((s, e) => s + (e.iva || 0), 0))}</div>
              </div>
              <ChevronRight size={16} style={{ color: C.mute }} />
            </div>
          </Card>
        </button>
      )}

      {/* Aged stock alert hero */}
      {kpis.aged_count > 0 && (
        <Card className="p-4" style={{ background: `linear-gradient(135deg, ${C.ruby}11, ${C.amber}08)`, border: `1px solid ${C.ruby}44` }}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} style={{ color: C.ruby }} />
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: C.cream }}>{kpis.aged_count} relojes añejos (&gt;45d)</div>
              <div className="text-xs mt-0.5" style={{ color: C.dim }}>{euro(kpis.aged_value)} de capital bloqueado</div>
            </div>
            <button onClick={() => setView({ name: "stock", filter: "aged" })}>
              <ChevronRight size={18} style={{ color: C.amber }} />
            </button>
          </div>
        </Card>
      )}

      {/* Lost/returned alert */}
      {(kpis.lost_count > 0 || kpis.returned_count > 0) && (
        <Card className="p-4" style={{ background: `${C.ruby}08`, border: `1px solid ${C.ruby}33` }}>
          <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.ruby }}>Incidencias 2T</div>
          <div className="grid grid-cols-2 gap-3">
            {kpis.lost_count > 0 && (
              <div>
                <div className="text-xs" style={{ color: C.dim }}>Perdidos</div>
                <div className="font-serif text-lg" style={{ color: C.ruby, fontFamily: "'Fraunces', serif" }}>{kpis.lost_count} · {euro(kpis.lost_value)}</div>
              </div>
            )}
            {kpis.returned_count > 0 && (
              <div>
                <div className="text-xs" style={{ color: C.dim }}>Devueltos</div>
                <div className="font-serif text-lg" style={{ color: C.amber, fontFamily: "'Fraunces', serif" }}>{kpis.returned_count}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Ritmo Q2 chart */}
      {dailySales.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} style={{ color: C.gold }} />
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Ritmo diario 2T</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.mute, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 8, color: C.cream }} />
              <Bar dataKey="ventas" fill={C.gold} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top alerts */}
      {alerts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={14} style={{ color: C.amber }} />
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Acciones pendientes</span>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b" style={{ borderColor: C.line + "55" }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: a.severity === "high" ? C.ruby : C.amber }} />
                <div className="text-xs flex-1" style={{ color: C.dim }}>{a.msg}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Q1 vs Q2 comparison */}
      {kpis.ops > 0 && (() => {
        const q1 = state.settings.q1_baseline;
        const q2_proj = {
          ops: Math.round(kpis.pace * 91),
          revenue: (kpis.revenue / kpis.days_q2) * 91,
          profit: (kpis.profit / kpis.days_q2) * 91,
          avg_profit: kpis.avg_profit,
          roi: kpis.avg_roi * 100,
        };
        const delta = (q2, q1) => q1 ? (q2 / q1 - 1) * 100 : 0;
        const rows = [
          { label: "Ventas", q1: q1.ops, q2: q2_proj.ops, format: (v) => Math.round(v) },
          { label: "Beneficio", q1: q1.profit, q2: q2_proj.profit, format: euro },
          { label: "Bº medio/op", q1: q1.avg_profit, q2: q2_proj.avg_profit, format: euro },
          { label: "ROI %", q1: q1.roi, q2: q2_proj.roi, format: (v) => `${v.toFixed(0)}%`, invert_good: false },
        ];
        return (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} style={{ color: C.jade }} />
              <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>1T cierre → 2T proyección</span>
            </div>
            <div className="space-y-2">
              {rows.map(r => {
                const d = delta(r.q2, r.q1);
                return (
                  <div key={r.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: C.dim }}>{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: C.mute }}>{r.format(r.q1)}</span>
                      <span style={{ color: C.mute }}>→</span>
                      <span style={{ color: C.cream }}>{r.format(r.q2)}</span>
                      <span className="text-xs font-semibold min-w-[48px] text-right" style={{ color: d >= 0 ? C.jade : C.ruby }}>
                        {d >= 0 ? "+" : ""}{d.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {/* Top brands */}
      {brandPerf.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} style={{ color: C.gold }} />
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Top marcas 2T</span>
          </div>
          <div className="space-y-2.5">
            {brandPerf.map((b, i) => (
              <div key={b.brand} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xs" style={{ color: C.gold, fontFamily: "'Fraunces', serif" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm" style={{ color: C.cream }}>{b.brand}</span>
                  <span className="text-xs" style={{ color: C.mute }}>· {b.ops} ops</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: C.jade }}>{euro(b.profit)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: STOCK LIST
// ═══════════════════════════════════════════════════════════
const StockView = ({ state, setView, filter }) => {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(filter || "all");

  // Active = not sold/lost (includes stock, listed, returned)
  const active = state.watches.filter(w => w.status !== "sold" && w.status !== "lost");

  const filtered = useMemo(() => {
    let list = active.map(w => ({ ...w, days: daysBetween(w.purchase_date, today()) }));
    if (tab === "aged") list = list.filter(w => w.days > 45 && (w.status === "stock" || w.status === "listed"));
    if (tab === "fresh") list = list.filter(w => w.days <= 15 && w.status === "stock");
    if (tab === "listed") list = list.filter(w => w.status === "listed");
    if (tab === "returned") list = list.filter(w => w.status === "returned");
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(w => `${w.brand} ${w.model} ${w.purchase_source}`.toLowerCase().includes(qq));
    }
    return list.sort((a, b) => b.days - a.days);
  }, [active, q, tab]);

  const tabs = [
    { id: "all", label: "Todo", count: active.length },
    { id: "fresh", label: "Fresco", count: active.filter(w => w.status === "stock" && daysBetween(w.purchase_date, today()) <= 15).length },
    { id: "listed", label: "Publicado", count: active.filter(w => w.status === "listed").length },
    { id: "aged", label: "Añejo", count: active.filter(w => (w.status === "stock" || w.status === "listed") && daysBetween(w.purchase_date, today()) > 45).length },
    { id: "returned", label: "Devuelto", count: active.filter(w => w.status === "returned").length },
  ];

  const statusChip = (w) => {
    if (w.status === "listed") return <Chip color={C.ice}>{w.listing_channel} · €{w.listing_price || "?"}</Chip>;
    if (w.status === "returned") return <Chip color={C.ruby}>Devuelto</Chip>;
    const age = ageClass(w.days);
    return <Chip color={age.color}>{w.days}d · {age.label}</Chip>;
  };

  const iconColor = (w) => {
    if (w.status === "listed") return C.ice;
    if (w.status === "returned") return C.ruby;
    return ageClass(w.days).color;
  };

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <div className="flex items-baseline justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Stock</h1>
          <div className="text-xs mt-1" style={{ color: C.dim }}>{active.length} activos · {euro(active.reduce((s, w) => s + (w.purchase_price || 0), 0))}</div>
        </div>
        <Btn onClick={() => setView({ name: "add-watch" })} icon={Plus} variant="primary">Añadir</Btn>
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: C.raised, border: `1px solid ${C.line}` }}>
        <Search size={14} style={{ color: C.mute }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Marca, modelo, proveedor..."
          className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.cream }} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap flex-shrink-0"
            style={{
              background: tab === t.id ? C.gold : "transparent",
              color: tab === t.id ? C.ink : C.dim,
              border: `1px solid ${tab === t.id ? C.gold : C.line}`,
            }}>
            {t.label} <span className="opacity-60">· {t.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(w => (
          <button key={w.id} onClick={() => setView({ name: "watch-detail", id: w.id })}
            className="w-full text-left">
            <Card className="p-3.5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: `radial-gradient(circle, ${iconColor(w)}22 0%, transparent 70%)`,
                  border: `1px solid ${iconColor(w)}44`
                }}>
                  <Watch size={18} style={{ color: iconColor(w) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-base truncate" style={{ color: C.cream, fontFamily: "'Fraunces', serif" }}>{w.brand}</span>
                    <span className="text-sm font-semibold flex-shrink-0" style={{ color: C.gold }}>{euroExact(w.purchase_price)}</span>
                  </div>
                  <div className="text-xs truncate" style={{ color: C.dim }}>{w.model}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {statusChip(w)}
                    {w.target_channel && w.status === "stock" && <Chip color={C.mute}>→ {w.target_channel}</Chip>}
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
        {filtered.length === 0 && (
          <Card className="p-8 text-center">
            <Package size={32} className="mx-auto mb-3" style={{ color: C.mute }} />
            <div className="text-sm" style={{ color: C.dim }}>Sin resultados</div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: WATCH DETAIL
// ═══════════════════════════════════════════════════════════
const WatchDetail = ({ state, dispatch, id, setView }) => {
  const watch = state.watches.find(w => w.id === id);
  const [noteModal, setNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [listModal, setListModal] = useState(false);
  const [listing, setListing] = useState({ listing_channel: "", listing_price: 0, listing_url: "", listing_date: today() });
  const [returnModal, setReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({ return_reason: "", returned_date: today() });
  const [lostModal, setLostModal] = useState(false);
  const [lostData, setLostData] = useState({ lost_reason: "", lost_date: today() });
  const [dropModal, setDropModal] = useState(false);
  const [newPrice, setNewPrice] = useState(0);

  if (!watch) return <div className="p-4" style={{ color: C.dim }}>No encontrado</div>;

  const days = watch.status === "sold"
    ? daysBetween(watch.purchase_date, watch.sale_date)
    : daysBetween(watch.purchase_date, today());
  const age = ageClass(days);
  const events = deriveEvents(watch);
  const suggestions = getSuggestions(watch, state.settings, state.watches);
  const prediction = watch.status === "stock" ? predictTimeToSell(watch, state.watches) : null;

  // Comparables for this model
  const comps = state.price_comps.filter(c =>
    c.brand === watch.brand && c.model.toLowerCase().includes(watch.model.split(" ")[0].toLowerCase())
  );
  const avgComp = comps.length ? comps.reduce((s, c) => s + c.price, 0) / comps.length : null;
  const proj_profit = avgComp ? (avgComp * 0.85 + 35 - watch.purchase_price) : null;

  // REBU fiscal calculation (correct)
  const rebuVat = watch.status === "sold" ? calcRebuVat(watch.sale_price, watch.purchase_price, state.settings.iva_rate) : 0;

  const statusBadge = () => {
    switch (watch.status) {
      case "stock":    return <Chip color={age.color}>En stock · {days}d</Chip>;
      case "listed":   return <Chip color={C.ice}>Publicado · {watch.listing_channel}</Chip>;
      case "sold":     return <Chip color={C.jade}>Vendido</Chip>;
      case "returned": return <Chip color={C.ruby}>Devuelto</Chip>;
      case "lost":     return <Chip color={C.ruby}>Perdido</Chip>;
      default:         return <Chip color={C.mute}>{watch.status}</Chip>;
    }
  };

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <button onClick={() => setView({ name: "stock" })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
        <ChevronLeft size={14} /> Volver al stock
      </button>

      <Card className="p-5" style={{ background: `linear-gradient(135deg, ${C.surface} 0%, ${C.coal} 100%)` }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {statusBadge()}
          {watch.target_channel && watch.status === "stock" && <Chip color={C.copper}>→ {watch.target_channel}</Chip>}
          {watch.regimen_iva && <Chip color={C.mute}>{watch.regimen_iva}</Chip>}
        </div>
        <div className="font-serif text-2xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>{watch.brand}</div>
        <div className="text-base" style={{ color: C.dim }}>{watch.model}</div>
        <div className="text-xs mt-2 flex items-center gap-3 flex-wrap" style={{ color: C.mute }}>
          <span>{watch.mechanism}</span>
          {watch.size && <span>· {watch.size}</span>}
          {watch.year && <span>· {watch.year}</span>}
          {watch.condition && <span>· {watch.condition}</span>}
        </div>
      </Card>

      {/* Photos */}
      <PhotoGallery watchId={watch.id} />

      {/* Suggestions */}
      <SuggestionsPanel suggestions={suggestions} />

      {/* Core numbers */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Compra" value={euroExact(watch.purchase_price)} sub={watch.purchase_source} accent={C.copper} icon={Tag} />
        {watch.status === "sold" ? (
          <StatCard label="Venta" value={euroExact(watch.sale_price)} sub={watch.sale_channel} accent={C.jade} icon={CheckCircle2} />
        ) : watch.status === "listed" ? (
          <StatCard label="Publicado" value={euroExact(watch.listing_price)} sub={watch.listing_channel} accent={C.ice} icon={Tag} />
        ) : (
          <StatCard label="Objetivo" value={avgComp ? euroExact(avgComp) : "—"} sub={comps.length ? `${comps.length} comps` : "sin comps"} accent={C.gold} icon={Target} />
        )}
      </div>

      {/* Listing URL */}
      {watch.listing_url && (
        <Card className="p-3">
          <a href={watch.listing_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm" style={{ color: C.ice }}>
            <ExternalLink size={14} />
            <span className="truncate flex-1">{watch.listing_url}</span>
          </a>
        </Card>
      )}

      {/* Time-to-sell prediction */}
      {prediction && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} style={{ color: C.ice }} />
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Predicción venta</span>
          </div>
          <div className="text-sm" style={{ color: C.cream }}>Tiempo medio hasta venta: <span className="font-semibold" style={{ color: C.ice }}>{prediction.median} días</span></div>
          <div className="text-xs mt-1" style={{ color: C.mute }}>Rango {prediction.p25}-{prediction.p75}d · {prediction.scope === "global" ? "dato global" : prediction.scope} · n={prediction.sample_size}</div>
        </Card>
      )}

      {/* Projection for stock/listed */}
      {(watch.status === "stock" || watch.status === "listed") && proj_profit !== null && (
        <Card className="p-4">
          <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.mute }}>Proyección</div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm" style={{ color: C.dim }}>Beneficio esperado</span>
            <span className="font-serif text-xl" style={{ color: proj_profit >= 120 ? C.jade : C.amber, fontFamily: "'Fraunces', serif" }}>{euroExact(proj_profit)}</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm" style={{ color: C.dim }}>ROI esperado</span>
            <span className="text-sm font-semibold" style={{ color: C.cream }}>{pct(proj_profit / watch.purchase_price)}</span>
          </div>
        </Card>
      )}

      {/* Sold details */}
      {watch.status === "sold" && (
        <Card className="p-4">
          <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Resultado venta</div>
          <div className="space-y-1.5 text-sm">
            <Row label="Cliente" value={watch.customer_name || "—"} />
            <Row label="País" value={watch.customer_country || "—"} />
            <Row label="Fecha" value={watch.sale_date} />
            <Row label="Envío cobrado" value={euroExact(watch.sale_shipping)} />
            <Row label="Factura" value={watch.factura_num || "sin asignar"} valColor={watch.factura_estado === "PDF pendiente" ? C.amber : C.jade} />
            {watch.regimen_iva === "REBU" && rebuVat > 0 && (
              <>
                <div className="h-px my-2" style={{ background: C.line }} />
                <Row label="IVA repercutido (REBU, margen)" value={euroExact(rebuVat)} valColor={C.amber} />
              </>
            )}
          </div>
        </Card>
      )}

      {/* Returned details */}
      {watch.status === "returned" && (
        <Card className="p-4" style={{ background: `${C.ruby}11`, border: `1px solid ${C.ruby}44` }}>
          <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.ruby }}>Devolución</div>
          <div className="text-sm space-y-1" style={{ color: C.cream }}>
            <Row label="Fecha devolución" value={watch.returned_date} />
            <Row label="Motivo" value={watch.return_reason || "sin especificar"} />
          </div>
        </Card>
      )}

      {/* Lost details */}
      {watch.status === "lost" && (
        <Card className="p-4" style={{ background: `${C.ruby}11`, border: `1px solid ${C.ruby}44` }}>
          <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.ruby }}>Pérdida</div>
          <div className="text-sm space-y-1" style={{ color: C.cream }}>
            <Row label="Fecha pérdida" value={watch.lost_date} />
            <Row label="Motivo" value={watch.lost_reason || "sin especificar"} />
            <Row label="Capital perdido" value={euroExact(watch.purchase_price)} valColor={C.ruby} />
          </div>
        </Card>
      )}

      {watch.notes && (
        <Card className="p-4">
          <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.mute }}>Notas</div>
          <div className="text-sm" style={{ color: C.cream }}>{watch.notes}</div>
        </Card>
      )}

      {/* Comparables */}
      {comps.length > 0 && (
        <Card className="p-4">
          <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Comparables ({comps.length})</div>
          <div className="space-y-1.5">
            {comps.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span style={{ color: C.dim }}>{c.channel} · {c.date}</span>
                <span className="font-semibold" style={{ color: C.gold }}>{euroExact(c.price)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Timeline events={events} onAddNote={() => { setNoteText(""); setNoteModal(true); }} />

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {watch.status === "stock" && (
          <>
            <Btn onClick={() => { setListing({ listing_channel: watch.target_channel || "Catawiki", listing_price: Math.round((avgComp || watch.purchase_price * 1.8)), listing_url: "", listing_date: today() }); setListModal(true); }} icon={Tag} variant="primary" full>Publicar en canal</Btn>
            <Btn onClick={() => setView({ name: "sell-watch", id: watch.id })} icon={CheckCircle2} variant="success" full>Registrar venta directa</Btn>
            <Btn onClick={() => setView({ name: "listing", id: watch.id })} icon={FileText} variant="secondary" full>Generar texto listing</Btn>
            <Btn onClick={() => setView({ name: "edit-watch", id: watch.id })} icon={Edit3} variant="ghost" full>Editar</Btn>
          </>
        )}
        {watch.status === "listed" && (
          <>
            <Btn onClick={() => setView({ name: "sell-watch", id: watch.id })} icon={CheckCircle2} variant="success" full>Marcar vendido</Btn>
            <Btn onClick={() => { setNewPrice(watch.listing_price); setDropModal(true); }} icon={TrendingDown} variant="secondary" full>Ajustar precio</Btn>
            <Btn onClick={() => dispatch({ type: "UNLIST_WATCH", id: watch.id })} icon={RotateCcw} variant="ghost" full>Despublicar (volver a stock)</Btn>
            <Btn onClick={() => { setLostData({ lost_reason: "", lost_date: today() }); setLostModal(true); }} icon={XCircle} variant="danger" full>Marcar perdido</Btn>
          </>
        )}
        {watch.status === "sold" && (
          <>
            <Btn onClick={() => { setReturnData({ return_reason: "", returned_date: today() }); setReturnModal(true); }} icon={RotateCcw} variant="danger" full>Marcar devuelto</Btn>
            <Btn onClick={() => { setLostData({ lost_reason: "", lost_date: today() }); setLostModal(true); }} icon={XCircle} variant="danger" full>Marcar perdido</Btn>
            <Btn onClick={() => setView({ name: "edit-watch", id: watch.id })} icon={Edit3} variant="secondary" full>Editar</Btn>
          </>
        )}
        {watch.status === "returned" && (
          <Btn onClick={() => dispatch({ type: "RELIST_AFTER_RETURN", id: watch.id })} icon={RotateCcw} variant="secondary" full>Devolver a stock</Btn>
        )}
        {watch.status === "lost" && (
          <Btn onClick={() => setView({ name: "edit-watch", id: watch.id })} icon={Edit3} variant="secondary" full>Editar</Btn>
        )}
        <Btn onClick={() => {
          if (confirm(`¿Eliminar ${watch.brand} ${watch.model}?`)) {
            dispatch({ type: "DELETE_WATCH", id: watch.id });
            savePhotos(watch.id, []);
            setView({ name: "stock" });
          }
        }} icon={Trash2} variant="danger" full>Eliminar</Btn>
      </div>

      {/* Note modal */}
      {noteModal && (
        <Modal title="Añadir nota al historial" onClose={() => setNoteModal(false)}>
          <Field label="Nota" value={noteText} onChange={setNoteText} rows={3} placeholder="ej. Cliente interesado pide descuento..." />
          <div className="mt-3">
            <Btn onClick={() => {
              if (!noteText.trim()) return;
              dispatch({ type: "ADD_WATCH_EVENT", id: watch.id, event: { type: "note", date: today(), note: noteText.trim() } });
              setNoteModal(false);
            }} icon={Save} variant="primary" full>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* List modal */}
      {listModal && (
        <Modal title="Publicar en canal" onClose={() => setListModal(false)}>
          <div className="space-y-3">
            <Field label="Canal" value={listing.listing_channel} onChange={(v) => setListing({ ...listing, listing_channel: v })}
              options={["Catawiki", "Vinted", "Chrono24", "eBay", "Wallapop"]} />
            <Field label="Precio de salida (€)" type="number" value={listing.listing_price} onChange={(v) => setListing({ ...listing, listing_price: v })} />
            <Field label="URL del listing (opcional)" value={listing.listing_url} onChange={(v) => setListing({ ...listing, listing_url: v })} placeholder="https://..." />
            <Field label="Fecha" type="date" value={listing.listing_date} onChange={(v) => setListing({ ...listing, listing_date: v })} />
            <Btn onClick={() => {
              if (!listing.listing_channel || !listing.listing_price) return alert("Canal y precio obligatorios");
              dispatch({ type: "LIST_WATCH", id: watch.id, listing });
              setListModal(false);
            }} icon={Tag} variant="primary" full>Publicar</Btn>
          </div>
        </Modal>
      )}

      {/* Return modal */}
      {returnModal && (
        <Modal title="Registrar devolución" onClose={() => setReturnModal(false)}>
          <div className="space-y-3">
            <Field label="Motivo" value={returnData.return_reason} onChange={(v) => setReturnData({ ...returnData, return_reason: v })}
              options={["No conforme con descripción", "Daño en envío", "Cliente arrepentido (14d)", "Autenticidad discutida", "Otro"]} />
            <Field label="Fecha devolución" type="date" value={returnData.returned_date} onChange={(v) => setReturnData({ ...returnData, returned_date: v })} />
            <Btn onClick={() => {
              dispatch({ type: "RETURN_WATCH", id: watch.id, ...returnData });
              setReturnModal(false);
            }} icon={RotateCcw} variant="danger" full>Confirmar devolución</Btn>
          </div>
        </Modal>
      )}

      {/* Lost modal */}
      {lostModal && (
        <Modal title="Marcar como perdido" onClose={() => setLostModal(false)}>
          <div className="space-y-3">
            <div className="p-3 rounded-xl text-xs" style={{ background: `${C.ruby}11`, border: `1px solid ${C.ruby}44`, color: C.ruby }}>
              ⚠ Capital a dar por perdido: {euroExact(watch.purchase_price)}
            </div>
            <Field label="Motivo" value={lostData.lost_reason} onChange={(v) => setLostData({ ...lostData, lost_reason: v })}
              options={["Perdido en envío", "Robo en envío", "Dañado sin recuperación", "Cliente no paga y no recupero", "Error de identificación", "Otro"]} />
            <Field label="Fecha" type="date" value={lostData.lost_date} onChange={(v) => setLostData({ ...lostData, lost_date: v })} />
            <Btn onClick={() => {
              dispatch({ type: "LOST_WATCH", id: watch.id, ...lostData });
              setLostModal(false);
            }} icon={XCircle} variant="danger" full>Confirmar pérdida</Btn>
          </div>
        </Modal>
      )}

      {/* Price drop modal */}
      {dropModal && (
        <Modal title="Ajustar precio" onClose={() => setDropModal(false)}>
          <div className="space-y-3">
            <div className="text-sm" style={{ color: C.dim }}>Precio actual: <span style={{ color: C.cream }}>{euroExact(watch.listing_price)}</span></div>
            <Field label="Nuevo precio (€)" type="number" value={newPrice} onChange={setNewPrice} />
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setNewPrice(Math.round(watch.listing_price * 0.95))} className="p-2 rounded-xl text-xs" style={{ background: C.raised, color: C.cream, border: `1px solid ${C.line}` }}>-5%</button>
              <button onClick={() => setNewPrice(Math.round(watch.listing_price * 0.9))} className="p-2 rounded-xl text-xs" style={{ background: C.raised, color: C.amber, border: `1px solid ${C.amber}55` }}>-10%</button>
              <button onClick={() => setNewPrice(Math.round(watch.listing_price * 0.85))} className="p-2 rounded-xl text-xs" style={{ background: C.raised, color: C.ruby, border: `1px solid ${C.ruby}55` }}>-15%</button>
            </div>
            <Btn onClick={() => {
              dispatch({ type: "DROP_PRICE", id: watch.id, new_price: newPrice });
              setDropModal(false);
            }} icon={TrendingDown} variant="primary" full>Ajustar a {euroExact(newPrice)}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Row = ({ label, value, valColor }) => (
  <div className="flex items-center justify-between">
    <span style={{ color: C.mute }}>{label}</span>
    <span style={{ color: valColor || C.cream }}>{value}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PHOTO GALLERY
// ═══════════════════════════════════════════════════════════
const PhotoGallery = ({ watchId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await loadPhotos(watchId);
      if (!cancelled) {
        setPhotos(p);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [watchId]);

  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const newPhotos = [...photos];
      const added = [];
      for (const file of files) {
        if (newPhotos.length >= 8) break;
        const dataUrl = await resizeImage(file, 800, 0.7);
        const photo = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          data: dataUrl,
          added: today()
        };
        newPhotos.push(photo);
        added.push(photo);
      }
      const result = await savePhotos(watchId, newPhotos);
      if (!result.ok) {
        setError(`Guardado falló: ${result.error}`);
        return;
      }
      const verified = await loadPhotos(watchId);
      if (verified.length !== newPhotos.length) {
        setError(`Verificación falló: se guardaron ${verified.length}/${newPhotos.length}`);
        setPhotos(verified);
      } else {
        setPhotos(verified);
      }
      // Fire-and-forget cloud sync for each new photo
      const { url } = getGasConfig();
      if (url) {
        for (const p of added) {
          syncPhotoToCloud(watchId, p).then(cloudUrl => {
            if (cloudUrl) {
              // Update UI with the url once available
              loadPhotos(watchId).then(setPhotos);
            }
          });
        }
      }
    } catch (err) {
      setError("Error: " + (err?.message || err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = async (idx) => {
    if (!confirm("¿Eliminar foto?")) return;
    const target = photos[idx];
    const next = photos.filter((_, i) => i !== idx);
    const result = await savePhotos(watchId, next);
    if (!result.ok) {
      setError(`Borrado falló: ${result.error}`);
      return;
    }
    setPhotos(next);
    if (lightbox === idx) setLightbox(null);
    else if (lightbox !== null && lightbox > idx) setLightbox(lightbox - 1);
    // Delete from cloud too
    const { url } = getGasConfig();
    if (url && target?.url) {
      deletePhotoFromGas(watchId, target.id).catch(() => {
        queueOp({ type: "photo_delete", watchId, photoId: target.id });
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon size={14} style={{ color: C.gold }} />
          <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Fotos ({photos.length}/8)</span>
        </div>
        <label className={`cursor-pointer flex items-center gap-1 text-xs font-semibold ${uploading ? "opacity-50" : ""}`} style={{ color: C.gold }}>
          <Camera size={14} />
          {uploading ? "Subiendo..." : "Añadir"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} disabled={uploading || photos.length >= 8} />
        </label>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-xl text-xs" style={{ background: `${C.ruby}15`, border: `1px solid ${C.ruby}55`, color: C.ruby }}>
          ⚠ {error}
          <button onClick={() => setError(null)} className="float-right ml-2">✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-xs text-center py-4" style={{ color: C.mute }}>Cargando...</div>
      ) : photos.length === 0 ? (
        <label className="cursor-pointer block">
          <div className="rounded-xl border-2 border-dashed p-8 text-center transition-all hover:opacity-80" style={{ borderColor: C.line, color: C.mute }}>
            <Camera size={28} className="mx-auto mb-2" />
            <div className="text-xs">Toca para añadir fotos del reloj</div>
            <div className="text-[10px] mt-1 opacity-60">Dial, reverso, movimiento, muñeca...</div>
          </div>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} />
        </label>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <button key={p.id || i} onClick={() => setLightbox(i)} className="aspect-square rounded-xl overflow-hidden relative group" style={{ border: `1px solid ${C.line}` }}>
              <img src={p.url || p.data} alt="" className="w-full h-full object-cover" />
              {getGasConfig().url && (
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  {p.url
                    ? <Cloud size={10} style={{ color: C.jade }} />
                    : <Loader2 size={10} className="animate-spin" style={{ color: C.amber }} />}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && photos[lightbox] && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: C.raised, border: `1px solid ${C.line}` }}>
            <X size={18} style={{ color: C.cream }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); removePhoto(lightbox); }} className="absolute top-4 left-4 p-2 rounded-full" style={{ background: C.raised, border: `1px solid ${C.ruby}55` }}>
            <Trash2 size={18} style={{ color: C.ruby }} />
          </button>
          <img src={photos[lightbox].url || photos[lightbox].data} alt="" className="max-w-full max-h-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: C.raised }}>
                <ChevronLeft size={18} style={{ color: C.cream }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: C.raised }}>
                <ChevronRight size={18} style={{ color: C.cream }} />
              </button>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════
const Timeline = ({ events, onAddNote }) => {
  if (events.length === 0) return null;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History size={14} style={{ color: C.gold }} />
          <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Historial</span>
        </div>
        {onAddNote && (
          <button onClick={onAddNote} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.gold }}>
            <Plus size={12} /> Nota
          </button>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-1.5 top-1 bottom-1 w-px" style={{ background: C.line }} />
        <div className="space-y-3">
          {events.map((e, i) => {
            const ev = EVENT_TYPES[e.type] || EVENT_TYPES.note;
            return (
              <div key={i} className="relative pl-6">
                <div className="absolute left-0 top-0.5 w-3 h-3 rounded-full" style={{
                  background: ev.color,
                  boxShadow: `0 0 0 2px ${C.surface}`
                }} />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold" style={{ color: ev.color }}>{ev.label}</span>
                  <span className="text-[10px]" style={{ color: C.mute }}>{e.date}</span>
                </div>
                {e.note && <div className="text-sm mt-0.5" style={{ color: C.cream }}>{e.note}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════
// MODAL (reusable)
// ═══════════════════════════════════════════════════════════
const Modal = ({ title, onClose, children }) => (
  <div onClick={onClose} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-serif text-lg" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>{title}</span>
        <button onClick={onClose}><X size={18} style={{ color: C.mute }} /></button>
      </div>
      {children}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// SUGGESTIONS PANEL
// ═══════════════════════════════════════════════════════════
const SuggestionsPanel = ({ suggestions, onAction }) => {
  if (suggestions.length === 0) return null;
  return (
    <Card className="p-4" style={{ background: `linear-gradient(135deg, ${C.amber}11, ${C.gold}08)`, border: `1px solid ${C.amber}44` }}>
      <div className="flex items-center gap-2 mb-2">
        <Wand2 size={14} style={{ color: C.amber }} />
        <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.amber }}>Sugerencias</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: s.priority === "high" ? C.ruby : C.amber }} />
            <div className="text-sm flex-1" style={{ color: C.cream }}>{s.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: ADD/EDIT WATCH
// ═══════════════════════════════════════════════════════════
const WatchForm = ({ state, dispatch, editId, setView }) => {
  const editing = editId ? state.watches.find(w => w.id === editId) : null;
  const [w, setW] = useState(editing || {
    brand: "", model: "", mechanism: "Automático", year: "", size: "",
    condition: "Buena", purchase_price: 0, purchase_date: today(),
    purchase_source: "", notes: "", target_channel: "Catawiki", status: "stock"
  });

  const u = (k, v) => setW({ ...w, [k]: v });

  const save = () => {
    if (!w.brand || !w.purchase_price) { alert("Marca y precio de compra son obligatorios"); return; }
    if (editing) {
      dispatch({ type: "UPDATE_WATCH", watch: w });
    } else {
      dispatch({ type: "ADD_WATCH", watch: { ...w, id: uid() } });
    }
    setView({ name: editing ? "watch-detail" : "stock", id: editing?.id });
  };

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <button onClick={() => setView(editing ? { name: "watch-detail", id: editing.id } : { name: "stock" })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
        <ChevronLeft size={14} /> Volver
      </button>
      <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>{editing ? "Editar reloj" : "Nuevo reloj"}</h1>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca *" value={w.brand} onChange={(v) => u("brand", v)} />
          <Field label="Modelo" value={w.model} onChange={(v) => u("model", v)} />
          <Field label="Mecanismo" value={w.mechanism} onChange={(v) => u("mechanism", v)}
            options={["Automático", "Cuarzo", "Cuerda", "Electrónico"]} />
          <Field label="Tamaño" value={w.size} onChange={(v) => u("size", v)} placeholder="ej. 40mm" />
          <Field label="Año" value={w.year} onChange={(v) => u("year", v)} placeholder="ej. 1970s" />
          <Field label="Condición" value={w.condition} onChange={(v) => u("condition", v)}
            options={["NOS", "Muy buena", "Buena", "Regular", "Reparado"]} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Compra</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio * (€)" type="number" value={w.purchase_price} onChange={(v) => u("purchase_price", v)} />
          <Field label="Fecha" type="date" value={w.purchase_date} onChange={(v) => u("purchase_date", v)} />
        </div>
        <Field label="Proveedor" value={w.purchase_source} onChange={(v) => u("purchase_source", v)}
          options={["Vinted", "Wallapop", "eBay", "Cash Converters", "Rastro", "RealCash", "Noza", "TodoColección", "TicDistribution", "Otro"]} />
        <Field label="Canal objetivo" value={w.target_channel} onChange={(v) => u("target_channel", v)}
          options={["Catawiki", "Vinted", "Chrono24"]} />
        <Field label="Notas" value={w.notes} onChange={(v) => u("notes", v)} rows={3} />
      </Card>

      <Btn onClick={save} icon={Save} variant="primary" full>{editing ? "Guardar cambios" : "Añadir al stock"}</Btn>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: SELL WATCH
// ═══════════════════════════════════════════════════════════
const SellView = ({ state, dispatch, id, setView }) => {
  const watch = state.watches.find(w => w.id === id);
  const [sale, setSale] = useState({
    sale_channel: watch?.target_channel || watch?.listing_channel || "Catawiki",
    sale_price: watch?.listing_price || 0,
    sale_shipping: state.settings.envio_cobrado_medio,
    sale_date: today(),
    customer_name: "",
    customer_country: "",
    factura_num: "",
    factura_estado: "PDF pendiente",
  });
  const u = (k, v) => setSale({ ...sale, [k]: v });

  if (!watch) return <div className="p-4" style={{ color: C.dim }}>No encontrado</div>;

  const commission_rate = sale.sale_channel === "Catawiki" ? state.settings.catawiki_commission
    : sale.sale_channel === "Chrono24" ? state.settings.chrono24_commission
    : sale.sale_channel === "Vinted" ? state.settings.vinted_commission : 0;
  const commission = (sale.sale_price || 0) * commission_rate / 100;
  const iva_commission = commission * 0.21;
  const shipping_cost = state.settings.envio_medio;
  const iva_shipping = shipping_cost * 0.21;
  // REBU correct: IVA repercutido solo sobre margen (si venta > compra)
  const isRebu = watch.regimen_iva === "REBU";
  const rebu_vat = isRebu ? calcRebuVat(sale.sale_price, watch.purchase_price, state.settings.iva_rate) : 0;
  const profit_gross = (sale.sale_price || 0) - (watch.purchase_price || 0);
  const profit_net = profit_gross + (sale.sale_shipping || 0) - shipping_cost - commission - iva_commission - iva_shipping - rebu_vat;
  const roi = watch.purchase_price ? profit_net / watch.purchase_price : 0;

  const confirm_sale = () => {
    if (!sale.sale_price) { alert("Precio de venta obligatorio"); return; }
    dispatch({ type: "SELL_WATCH", id: watch.id, sale });
    setView({ name: "watch-detail", id: watch.id });
  };

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <button onClick={() => setView({ name: "watch-detail", id: watch.id })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
        <ChevronLeft size={14} /> Volver
      </button>
      <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Registrar venta</h1>
      <div className="text-sm" style={{ color: C.dim }}>{watch.brand} {watch.model} · Comprado por {euro(watch.purchase_price)}</div>

      <Card className="p-4 space-y-3">
        <Field label="Canal" value={sale.sale_channel} onChange={(v) => u("sale_channel", v)}
          options={["Catawiki", "Vinted", "Chrono24", "Otro"]} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio venta (€)" type="number" value={sale.sale_price} onChange={(v) => u("sale_price", v)} />
          <Field label="Envío cobrado (€)" type="number" value={sale.sale_shipping} onChange={(v) => u("sale_shipping", v)} />
        </div>
        <Field label="Fecha venta" type="date" value={sale.sale_date} onChange={(v) => u("sale_date", v)} />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Cliente</div>
        <Field label="Nombre" value={sale.customer_name} onChange={(v) => u("customer_name", v)} />
        <Field label="País (código ISO 2 letras)" value={sale.customer_country} onChange={(v) => u("customer_country", v)} placeholder="ES, FR, IT..." />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Factura</div>
        <Field label="Nº factura" value={sale.factura_num} onChange={(v) => u("factura_num", v)} placeholder="TL-2026-XXX" />
        <Field label="Estado" value={sale.factura_estado} onChange={(v) => u("factura_estado", v)}
          options={["PDF pendiente", "PDF generado", "Enviado", "Registrado en libro"]} />
      </Card>

      {sale.sale_price > 0 && (
        <Card className="p-4" style={{ background: profit_net >= 120 ? `${C.jade}11` : `${C.amber}11`, border: `1px solid ${profit_net >= 120 ? C.jade : C.amber}44` }}>
          <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.mute }}>Resultado proyectado</div>
          <div className="space-y-1 text-sm">
            <Row label="Ingresos brutos" value={euroExact((sale.sale_price || 0) + (sale.sale_shipping || 0))} />
            <Row label="Comisión canal + IVA" value={euroExact(commission + iva_commission)} valColor={C.ruby} />
            <Row label="Envío + IVA" value={euroExact(shipping_cost + iva_shipping)} valColor={C.ruby} />
            {isRebu && rebu_vat > 0 && (
              <Row label="IVA repercutido REBU (margen)" value={euroExact(rebu_vat)} valColor={C.amber} />
            )}
            <Row label="Coste compra" value={euroExact(watch.purchase_price)} valColor={C.ruby} />
            <div className="h-px my-2" style={{ background: C.line }} />
            <Row label="Beneficio neto" value={euroExact(profit_net)} valColor={profit_net >= 120 ? C.jade : C.amber} />
            <Row label="ROI" value={pct(roi)} valColor={roi >= 0.25 ? C.jade : C.amber} />
          </div>
        </Card>
      )}

      <Btn onClick={confirm_sale} icon={CheckCircle2} variant="success" full>Confirmar venta</Btn>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: OPPORTUNITIES (Scoring)
// ═══════════════════════════════════════════════════════════
const OpportunitiesView = ({ state, dispatch, setView }) => {
  const [showNew, setShowNew] = useState(false);
  const [opp, setOpp] = useState({
    brand: "", model: "", ask_price: 0, est_hammer: 0,
    channel: "Catawiki", red_flags: [], source: "Vinted", notes: ""
  });

  const active = state.opportunities.filter(o => o.decision === "pending");
  const archive = state.opportunities.filter(o => o.decision !== "pending");

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <div className="flex items-baseline justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Oportunidades</h1>
          <div className="text-xs mt-1" style={{ color: C.dim }}>{active.length} pendientes · {archive.length} archivadas</div>
        </div>
        <Btn onClick={() => setShowNew(!showNew)} icon={showNew ? X : Plus} variant="primary">{showNew ? "Cerrar" : "Evaluar"}</Btn>
      </div>

      {showNew && (
        <Card className="p-4 space-y-3">
          <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.gold }}>Nueva oportunidad</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca" value={opp.brand} onChange={(v) => setOpp({ ...opp, brand: v })} />
            <Field label="Modelo" value={opp.model} onChange={(v) => setOpp({ ...opp, model: v })} />
            <Field label="Precio pedido (€)" type="number" value={opp.ask_price} onChange={(v) => setOpp({ ...opp, ask_price: v })} />
            <Field label="Martillo estimado (€)" type="number" value={opp.est_hammer} onChange={(v) => setOpp({ ...opp, est_hammer: v })} />
            <Field label="Fuente" value={opp.source} onChange={(v) => setOpp({ ...opp, source: v })}
              options={["Vinted", "Wallapop", "eBay", "Cash Converters", "Rastro", "RealCash"]} />
            <Field label="Canal venta" value={opp.channel} onChange={(v) => setOpp({ ...opp, channel: v })}
              options={["Catawiki", "Chrono24", "Vinted"]} />
          </div>
          <Field label="Notas" value={opp.notes} onChange={(v) => setOpp({ ...opp, notes: v })} rows={2} />
          <RedFlagsEditor flags={opp.red_flags} onChange={(f) => setOpp({ ...opp, red_flags: f })} />

          {opp.ask_price > 0 && opp.est_hammer > 0 && (() => {
            const s = scoreOpportunity(opp, state.settings);
            return (
              <Card className="p-3" style={{ background: `${s.color}11`, border: `1px solid ${s.color}44` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-2xl" style={{ color: s.color, fontFamily: "'Fraunces', serif" }}>{s.verdict}</span>
                  <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Veredicto</span>
                </div>
                <div className="space-y-1 text-sm">
                  <Row label="Beneficio esperado" value={euro(s.profit)} valColor={s.color} />
                  <Row label="ROI esperado" value={pct(s.roi)} valColor={s.color} />
                  <Row label="Ingreso neto tras comisión" value={euro(s.net_sale)} />
                </div>
              </Card>
            );
          })()}

          <div className="flex gap-2">
            <Btn onClick={() => {
              if (!opp.brand || !opp.ask_price) return alert("Marca y precio obligatorios");
              dispatch({ type: "ADD_OPP", opp: { ...opp, id: uid(), created_date: today(), decision: "pending" } });
              setOpp({ brand: "", model: "", ask_price: 0, est_hammer: 0, channel: "Catawiki", red_flags: [], source: "Vinted", notes: "" });
              setShowNew(false);
            }} icon={Save} variant="primary" full>Guardar oportunidad</Btn>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {active.map(o => {
          const s = scoreOpportunity(o, state.settings);
          return (
            <Card key={o.id} className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Chip color={s.color}>{s.verdict}</Chip>
                    <Chip color={C.mute}>{o.channel}</Chip>
                  </div>
                  <div className="font-serif text-base" style={{ color: C.cream, fontFamily: "'Fraunces', serif" }}>{o.brand} {o.model}</div>
                  <div className="text-xs mt-1" style={{ color: C.dim }}>Pide {euro(o.ask_price)} · Martillo est. {euro(o.est_hammer)}</div>
                  {o.notes && <div className="text-xs mt-1 italic" style={{ color: C.mute }}>{o.notes}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-serif text-xl" style={{ color: s.color, fontFamily: "'Fraunces', serif" }}>{euro(s.profit)}</div>
                  <div className="text-xs" style={{ color: C.mute }}>{pct(s.roi)}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Btn onClick={() => {
                  const price = prompt("Precio final de compra (€):", o.ask_price);
                  if (price) dispatch({ type: "CONVERT_OPP", opp: o, price: parseFloat(price) });
                }} icon={CheckCircle2} variant="success" className="flex-1">Comprar</Btn>
                <Btn onClick={() => {
                  dispatch({ type: "UPDATE_OPP", opp: { ...o, decision: "rejected" } });
                }} icon={XCircle} variant="ghost">Descartar</Btn>
              </div>
            </Card>
          );
        })}
        {active.length === 0 && !showNew && (
          <Card className="p-8 text-center">
            <Sparkles size={32} className="mx-auto mb-3" style={{ color: C.mute }} />
            <div className="text-sm" style={{ color: C.dim }}>Sin oportunidades pendientes</div>
          </Card>
        )}
      </div>
    </div>
  );
};

const RedFlagsEditor = ({ flags, onChange }) => {
  const options = ["Redial", "Caja <36mm", "Modelo fake-prone (PRX/Seastar)", "Para piezas", "Proveedor dudoso", "Foto de stock"];
  const toggle = (f) => onChange(flags.includes(f) ? flags.filter(x => x !== f) : [...flags, f]);
  return (
    <div>
      <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.mute }}>Banderas rojas</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button key={o} onClick={() => toggle(o)}
            className="px-2.5 py-1 rounded-full text-xs transition-all"
            style={{
              background: flags.includes(o) ? `${C.ruby}22` : "transparent",
              color: flags.includes(o) ? C.ruby : C.dim,
              border: `1px solid ${flags.includes(o) ? C.ruby : C.line}`
            }}>{o}</button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: CUSTOMERS
// ═══════════════════════════════════════════════════════════
const CustomersView = ({ state, setView }) => {
  const customers = useMemo(() => {
    const by = {};
    state.watches.filter(w => w.status === "sold" && w.customer_name).forEach(w => {
      const key = w.customer_name;
      if (!by[key]) by[key] = { name: w.customer_name, country: w.customer_country, watches: [], total: 0, last_purchase: w.sale_date };
      by[key].watches.push(w);
      by[key].total += (w.sale_price || 0) + (w.sale_shipping || 0);
      if (w.sale_date > by[key].last_purchase) by[key].last_purchase = w.sale_date;
    });
    return Object.values(by).sort((a, b) => b.total - a.total);
  }, [state.watches]);

  const byCountry = useMemo(() => {
    const by = {};
    customers.forEach(c => {
      const k = c.country || "?";
      if (!by[k]) by[k] = { country: k, count: 0, revenue: 0 };
      by[k].count++;
      by[k].revenue += c.total;
    });
    return Object.values(by).sort((a, b) => b.revenue - a.revenue);
  }, [customers]);

  const repeat = customers.filter(c => c.watches.length > 1);

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <div className="pt-2">
        <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Clientes</h1>
        <div className="text-xs mt-1" style={{ color: C.dim }}>{customers.length} únicos · {repeat.length} repetidores</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ticket medio" value={euro(customers.length ? customers.reduce((s, c) => s + c.total, 0) / customers.length : 0)} icon={Euro} accent={C.gold} />
        <StatCard label="Países" value={byCountry.length} sub={byCountry[0]?.country + " top"} icon={MapPin} accent={C.copper} />
      </div>

      <Card className="p-4">
        <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Por país</div>
        <div className="space-y-2">
          {byCountry.slice(0, 8).map(c => (
            <div key={c.country} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: C.cream }}>{c.country} <span className="text-xs" style={{ color: C.mute }}>· {c.count}</span></span>
              <span className="text-sm font-semibold" style={{ color: C.gold }}>{euroExact(c.revenue)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Top compradores</div>
        <div className="space-y-1">
          {customers.slice(0, 15).map(c => (
            <button key={c.name} onClick={() => setView({ name: "customer-detail", customer: c.name })}
              className="w-full text-left p-2 rounded-lg transition-all hover:bg-black/20">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate" style={{ color: C.cream }}>{c.name}</span>
                    {c.watches.length > 1 && <Chip color={C.jade}>×{c.watches.length}</Chip>}
                  </div>
                  <div className="text-xs" style={{ color: C.mute }}>{c.country} · última: {c.last_purchase}</div>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: C.gold }}>{euroExact(c.total)}</span>
                <ChevronRight size={14} style={{ color: C.mute }} />
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: CUSTOMER DETAIL (contact log)
// ═══════════════════════════════════════════════════════════
const CustomerDetailView = ({ state, dispatch, customerName, setView }) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState({ type: "nota", note: "" });

  const purchases = useMemo(() =>
    state.watches.filter(w => w.status === "sold" && w.customer_name === customerName).sort((a, b) => (b.sale_date || "").localeCompare(a.sale_date || "")),
    [state.watches, customerName]
  );

  const notes = useMemo(() =>
    (state.customer_notes || []).filter(n => n.customer_name === customerName).sort((a, b) => b.date.localeCompare(a.date)),
    [state.customer_notes, customerName]
  );

  if (purchases.length === 0) {
    return (
      <div className="p-4">
        <button onClick={() => setView({ name: "customers" })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
          <ChevronLeft size={14} /> Volver
        </button>
        <div className="mt-4" style={{ color: C.dim }}>Cliente no encontrado</div>
      </div>
    );
  }

  const country = purchases[0].customer_country;
  const total = purchases.reduce((s, p) => s + (p.sale_price || 0) + (p.sale_shipping || 0), 0);
  const avg = total / purchases.length;
  const daysSinceLast = daysBetween(purchases[0].sale_date, today());

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <button onClick={() => setView({ name: "customers" })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
        <ChevronLeft size={14} /> Volver
      </button>

      <Card className="p-5" style={{ background: `linear-gradient(135deg, ${C.surface} 0%, ${C.coal} 100%)` }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Chip color={C.copper}>{country || "?"}</Chip>
          {purchases.length > 1 && <Chip color={C.jade}>Repetidor ×{purchases.length}</Chip>}
          <Chip color={C.mute}>Hace {daysSinceLast}d</Chip>
        </div>
        <div className="font-serif text-2xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>{customerName}</div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="LTV" value={euro(total)} icon={Euro} accent={C.gold} />
        <StatCard label="Ticket" value={euro(avg)} icon={Tag} accent={C.copper} />
        <StatCard label="Compras" value={purchases.length} icon={ShoppingBag} accent={C.jade} />
      </div>

      {/* Contact log */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} style={{ color: C.gold }} />
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Log de contacto</span>
          </div>
          <button onClick={() => { setNote({ type: "nota", note: "" }); setShowNoteModal(true); }} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.gold }}>
            <Plus size={12} /> Añadir
          </button>
        </div>
        {notes.length === 0 ? (
          <div className="text-xs py-3 text-center" style={{ color: C.mute }}>Sin interacciones registradas</div>
        ) : (
          <div className="space-y-2">
            {notes.map((n, i) => {
              const globalIdx = state.customer_notes.findIndex(x => x === n);
              const typeColor = n.type === "reclamacion" ? C.ruby : n.type === "pregunta" ? C.amber : n.type === "positivo" ? C.jade : C.ice;
              return (
                <div key={i} className="py-2 border-b" style={{ borderColor: C.line + "55" }}>
                  <div className="flex items-center justify-between mb-1">
                    <Chip color={typeColor}>{n.type}</Chip>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: C.mute }}>{n.date}</span>
                      <button onClick={() => dispatch({ type: "DELETE_CUSTOMER_NOTE", index: globalIdx })}>
                        <Trash2 size={12} style={{ color: C.ruby }} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: C.cream }}>{n.note}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Purchase history */}
      <Card className="p-4">
        <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Histórico compras</div>
        <div className="space-y-2">
          {purchases.map(p => (
            <button key={p.id} onClick={() => setView({ name: "watch-detail", id: p.id })}
              className="w-full text-left p-2 rounded-lg" style={{ background: C.raised + "55" }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate" style={{ color: C.cream }}>{p.brand} {p.model}</div>
                  <div className="text-xs" style={{ color: C.mute }}>{p.sale_date} · {p.sale_channel}</div>
                </div>
                <span className="text-sm font-semibold" style={{ color: C.gold }}>{euroExact(p.sale_price)}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {showNoteModal && (
        <Modal title="Añadir interacción" onClose={() => setShowNoteModal(false)}>
          <div className="space-y-3">
            <Field label="Tipo" value={note.type} onChange={(v) => setNote({ ...note, type: v })}
              options={["nota", "pregunta", "reclamacion", "positivo", "envio", "devolucion"]} />
            <Field label="Comentario" value={note.note} onChange={(v) => setNote({ ...note, note: v })} rows={3} />
            <Btn onClick={() => {
              if (!note.note.trim()) return;
              dispatch({ type: "ADD_CUSTOMER_NOTE", note: { ...note, customer_name: customerName, date: today() } });
              setShowNoteModal(false);
            }} icon={Save} variant="primary" full>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: LISTING GENERATOR
// ═══════════════════════════════════════════════════════════
const ListingView = ({ state, id, setView }) => {
  const watch = state.watches.find(w => w.id === id);
  const [channel, setChannel] = useState(watch?.target_channel || "Catawiki");
  const [copied, setCopied] = useState(null);
  if (!watch) return <div className="p-4" style={{ color: C.dim }}>No encontrado</div>;

  const listing = generateListing(watch, channel);
  const copy = (text, which) => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <button onClick={() => setView({ name: "watch-detail", id: watch.id })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
        <ChevronLeft size={14} /> Volver
      </button>
      <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Listing</h1>
      <div className="text-sm" style={{ color: C.dim }}>{watch.brand} {watch.model}</div>

      <div className="flex gap-1.5">
        {["Catawiki", "Vinted", "Chrono24"].map(c => (
          <button key={c} onClick={() => setChannel(c)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: channel === c ? C.gold : "transparent",
              color: channel === c ? C.ink : C.dim,
              border: `1px solid ${channel === c ? C.gold : C.line}`
            }}>{c}</button>
        ))}
      </div>

      <Card className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Título</span>
            <button onClick={() => copy(listing.title, "title")} className="text-xs flex items-center gap-1" style={{ color: copied === "title" ? C.jade : C.gold }}>
              <Copy size={12} /> {copied === "title" ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="p-3 rounded-xl text-sm" style={{ background: C.raised, color: C.cream, border: `1px solid ${C.line}` }}>{listing.title}</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Descripción</span>
            <button onClick={() => copy(listing.description, "desc")} className="text-xs flex items-center gap-1" style={{ color: copied === "desc" ? C.jade : C.gold }}>
              <Copy size={12} /> {copied === "desc" ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="p-3 rounded-xl text-sm whitespace-pre-wrap" style={{ background: C.raised, color: C.cream, border: `1px solid ${C.line}`, lineHeight: 1.6 }}>{listing.description}</div>
        </div>

        <Btn onClick={() => copy(`${listing.title}\n\n${listing.description}`, "all")} icon={Copy} variant="secondary" full>
          {copied === "all" ? "Copiado todo ✓" : "Copiar todo"}
        </Btn>
      </Card>

      <Card className="p-4">
        <div className="text-xs tracking-widest uppercase font-bold mb-2" style={{ color: C.mute }}>Sugerencias precio</div>
        <div className="text-xs" style={{ color: C.dim }}>
          Basado en tu coste de {euro(watch.purchase_price)} y comisión {channel === "Catawiki" ? "12.5%" : channel === "Chrono24" ? "6.5%" : "5%"}:
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <PricePill label="Break-even" value={euro(watch.purchase_price / ((channel === "Catawiki" ? 0.875 : channel === "Chrono24" ? 0.935 : 0.95)))} color={C.ruby} />
          <PricePill label="Objetivo ROI 25%" value={euro(watch.purchase_price * 1.25 / ((channel === "Catawiki" ? 0.875 : channel === "Chrono24" ? 0.935 : 0.95)))} color={C.amber} />
          <PricePill label="Objetivo 120€" value={euro((watch.purchase_price + 120) / ((channel === "Catawiki" ? 0.875 : channel === "Chrono24" ? 0.935 : 0.95)))} color={C.jade} />
        </div>
      </Card>
    </div>
  );
};

const PricePill = ({ label, value, color }) => (
  <div className="p-2 rounded-xl text-center" style={{ background: `${color}11`, border: `1px solid ${color}44` }}>
    <div className="text-[9px] tracking-widest uppercase font-bold mb-1" style={{ color: C.mute }}>{label}</div>
    <div className="text-sm font-semibold" style={{ color }}>{value}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// VIEW: PRICE COMPS
// ═══════════════════════════════════════════════════════════
const CompsView = ({ state, dispatch, setView }) => {
  const [showNew, setShowNew] = useState(false);
  const [comp, setComp] = useState({ brand: "", model: "", price: 0, channel: "Catawiki", date: today(), source: "hammer" });
  const [q, setQ] = useState("");

  const byModel = useMemo(() => {
    const by = {};
    state.price_comps.forEach(c => {
      const key = `${c.brand}|${c.model}`;
      if (!by[key]) by[key] = { brand: c.brand, model: c.model, prices: [], channels: new Set() };
      by[key].prices.push(c.price);
      by[key].channels.add(c.channel);
    });
    return Object.values(by).map(g => ({
      ...g,
      avg: g.prices.reduce((s, p) => s + p, 0) / g.prices.length,
      min: Math.min(...g.prices),
      max: Math.max(...g.prices),
      count: g.prices.length,
      channels: [...g.channels]
    })).sort((a, b) => b.count - a.count)
      .filter(g => !q || `${g.brand} ${g.model}`.toLowerCase().includes(q.toLowerCase()));
  }, [state.price_comps, q]);

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <div className="flex items-baseline justify-between pt-2">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Comparables</h1>
          <div className="text-xs mt-1" style={{ color: C.dim }}>{state.price_comps.length} registros · {byModel.length} modelos</div>
        </div>
        <Btn onClick={() => setShowNew(!showNew)} icon={showNew ? X : Plus} variant="primary">{showNew ? "Cerrar" : "Añadir"}</Btn>
      </div>

      {showNew && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca" value={comp.brand} onChange={(v) => setComp({ ...comp, brand: v })} />
            <Field label="Modelo" value={comp.model} onChange={(v) => setComp({ ...comp, model: v })} />
            <Field label="Precio (€)" type="number" value={comp.price} onChange={(v) => setComp({ ...comp, price: v })} />
            <Field label="Fecha" type="date" value={comp.date} onChange={(v) => setComp({ ...comp, date: v })} />
            <Field label="Canal" value={comp.channel} onChange={(v) => setComp({ ...comp, channel: v })}
              options={["Catawiki", "Chrono24", "Vinted", "eBay"]} />
            <Field label="Tipo" value={comp.source} onChange={(v) => setComp({ ...comp, source: v })}
              options={["hammer", "listing", "sold"]} />
          </div>
          <Btn onClick={() => {
            if (!comp.brand || !comp.price) return alert("Marca y precio obligatorios");
            dispatch({ type: "ADD_COMP", comp });
            setComp({ brand: "", model: "", price: 0, channel: "Catawiki", date: today(), source: "hammer" });
            setShowNew(false);
          }} icon={Save} variant="primary" full>Guardar</Btn>
        </Card>
      )}

      <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: C.raised, border: `1px solid ${C.line}` }}>
        <Search size={14} style={{ color: C.mute }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar marca o modelo..."
          className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.cream }} />
      </div>

      <div className="space-y-2">
        {byModel.map(g => (
          <Card key={`${g.brand}-${g.model}`} className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-serif text-base" style={{ color: C.cream, fontFamily: "'Fraunces', serif" }}>{g.brand}</div>
                <div className="text-xs truncate" style={{ color: C.dim }}>{g.model}</div>
                <div className="flex gap-1 mt-1.5">
                  {g.channels.map(ch => <Chip key={ch} color={C.mute}>{ch}</Chip>)}
                  <Chip color={C.copper}>{g.count} reg</Chip>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-serif text-lg" style={{ color: C.gold, fontFamily: "'Fraunces', serif" }}>{euro(g.avg)}</div>
                <div className="text-xs" style={{ color: C.mute }}>{euro(g.min)} - {euro(g.max)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: EXPENSES
// ═══════════════════════════════════════════════════════════
const ExpensesView = ({ state, dispatch, setView }) => {
  const [showNew, setShowNew] = useState(false);
  const [exp, setExp] = useState({
    date: today(), concept: "", provider: "", base: 0, iva: 0, total: 0, deducible: true
  });

  const expenses = state.expenses || [];
  const total = expenses.reduce((s, e) => s + (e.total || 0), 0);
  const base = expenses.reduce((s, e) => s + (e.base || 0), 0);
  const iva = expenses.reduce((s, e) => s + (e.iva || 0), 0);
  const deducible = expenses.filter(e => e.deducible).reduce((s, e) => s + (e.total || 0), 0);

  // Group by provider
  const byProvider = useMemo(() => {
    const by = {};
    expenses.forEach(e => {
      if (!by[e.provider]) by[e.provider] = { provider: e.provider, count: 0, total: 0 };
      by[e.provider].count++;
      by[e.provider].total += (e.total || 0);
    });
    return Object.values(by).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const saveExp = () => {
    if (!exp.concept || !exp.total) return alert("Concepto y total obligatorios");
    const calc_iva = exp.iva || (exp.total - exp.base);
    dispatch({ type: "ADD_EXPENSE", expense: { ...exp, iva: calc_iva } });
    setExp({ date: today(), concept: "", provider: "", base: 0, iva: 0, total: 0, deducible: true });
    setShowNew(false);
  };

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <button onClick={() => setView({ name: "dashboard" })} className="flex items-center gap-1 text-xs" style={{ color: C.mute }}>
        <ChevronLeft size={14} /> Volver
      </button>

      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Gastos</h1>
          <div className="text-xs mt-1" style={{ color: C.dim }}>{expenses.length} apuntes · 2T 2026</div>
        </div>
        <Btn onClick={() => setShowNew(!showNew)} icon={showNew ? X : Plus} variant="primary">{showNew ? "Cerrar" : "Añadir"}</Btn>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total" value={euroExact(total)} sub={`${expenses.length} apuntes`} icon={Euro} accent={C.ruby} />
        <StatCard label="IVA soportado" value={euroExact(iva)} sub={`Base €${base.toFixed(2)}`} icon={Percent} accent={C.amber} />
      </div>

      {showNew && (
        <Card className="p-4 space-y-3">
          <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.gold }}>Nuevo gasto</div>
          <Field label="Concepto" value={exp.concept} onChange={(v) => setExp({ ...exp, concept: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Proveedor" value={exp.provider} onChange={(v) => setExp({ ...exp, provider: v })} />
            <Field label="Fecha" type="date" value={exp.date} onChange={(v) => setExp({ ...exp, date: v })} />
            <Field label="Base (€)" type="number" value={exp.base} onChange={(v) => setExp({ ...exp, base: v, total: v * 1.21 })} />
            <Field label="Total (€)" type="number" value={exp.total} onChange={(v) => setExp({ ...exp, total: v })} />
          </div>
          <Btn onClick={saveExp} icon={Save} variant="primary" full>Guardar</Btn>
        </Card>
      )}

      <Card className="p-4">
        <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Por proveedor</div>
        <div className="space-y-2">
          {byProvider.map(p => (
            <div key={p.provider} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: C.cream }}>{p.provider} <span className="text-xs" style={{ color: C.mute }}>· {p.count}</span></span>
              <span className="text-sm font-semibold" style={{ color: C.gold }}>{euroExact(p.total)}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {expenses.map((e, i) => (
          <Card key={i} className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Chip color={e.deducible ? C.jade : C.mute}>{e.deducible ? "Deducible" : "No deduc."}</Chip>
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: C.mute }}>{e.date}</span>
                </div>
                <div className="text-sm truncate" style={{ color: C.cream }}>{e.concept}</div>
                <div className="text-xs truncate" style={{ color: C.dim }}>{e.provider}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold" style={{ color: C.cream }}>{euroExact(e.total)}</div>
                {e.iva > 0 && <div className="text-[10px]" style={{ color: C.mute }}>IVA {euroExact(e.iva)}</div>}
              </div>
              <button onClick={() => {
                if (confirm(`¿Eliminar "${e.concept}"?`)) dispatch({ type: "DELETE_EXPENSE", index: i });
              }}><Trash2 size={14} style={{ color: C.ruby }} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PHOTO DIAGNOSTIC — verify what's actually in storage
// ═══════════════════════════════════════════════════════════
const PhotoDiagnostic = ({ state }) => {
  const [keys, setKeys] = useState([]);
  const [checking, setChecking] = useState(false);
  const [detail, setDetail] = useState(null);

  const scan = async () => {
    setChecking(true);
    setDetail(null);
    try {
      const k = await listPhotoKeys();
      setKeys(k);

      // For each key, get size + count
      const rows = [];
      for (const key of k) {
        const watchId = key.replace("timelab:photos:", "");
        const watch = state.watches.find(w => w.id === watchId);
        try {
          const res = await window.storage.get(key);
          const parsed = res?.value ? JSON.parse(res.value) : [];
          rows.push({
            watchId,
            label: watch ? `${watch.brand} ${watch.model}` : "(reloj eliminado)",
            count: Array.isArray(parsed) ? parsed.length : 0,
            sizeKB: res?.value ? Math.round(res.value.length / 1024) : 0,
            orphan: !watch,
          });
        } catch (e) {
          rows.push({ watchId, label: "error leyendo", count: 0, sizeKB: 0, error: e.message });
        }
      }
      setDetail(rows);
    } catch (e) {
      setDetail([{ label: "Error: " + e.message }]);
    } finally {
      setChecking(false);
    }
  };

  const cleanOrphans = async () => {
    if (!confirm("¿Eliminar fotos de relojes borrados?")) return;
    const orphans = (detail || []).filter(d => d.orphan);
    for (const o of orphans) {
      try { await window.storage.delete(`timelab:photos:${o.watchId}`); } catch {}
    }
    await scan();
  };

  return (
    <div>
      <Btn onClick={scan} icon={ImageIcon} variant="secondary" full disabled={checking}>
        {checking ? "Escaneando..." : "Verificar fotos guardadas"}
      </Btn>
      {detail && (
        <div className="mt-3 text-xs space-y-1">
          {detail.length === 0 ? (
            <div style={{ color: C.mute }}>Sin fotos guardadas</div>
          ) : (
            <>
              <div className="flex justify-between pb-2 border-b" style={{ borderColor: C.line, color: C.dim }}>
                <span>{detail.length} relojes con fotos</span>
                <span>{detail.reduce((s, d) => s + (d.count || 0), 0)} fotos · {detail.reduce((s, d) => s + (d.sizeKB || 0), 0)}KB</span>
              </div>
              {detail.map(d => (
                <div key={d.watchId} className="flex items-center justify-between py-1">
                  <span className="truncate flex-1" style={{ color: d.orphan ? C.ruby : C.cream }}>
                    {d.orphan && "⚠ "}{d.label}
                  </span>
                  <span style={{ color: C.mute }}>{d.count} fotos · {d.sizeKB}KB</span>
                </div>
              ))}
              {detail.some(d => d.orphan) && (
                <div className="pt-2">
                  <Btn onClick={cleanOrphans} icon={Trash2} variant="danger" full>Limpiar huérfanas</Btn>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SYNC PANEL — Apps Script configuration
// ═══════════════════════════════════════════════════════════
const SyncPanel = ({ syncStatus, syncPush, syncPull }) => {
  const [gas, setGas] = useState(getGasConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const saveConfig = () => {
    setGasConfig({ url: gas.url.trim(), token: gas.token.trim() });
    setTestResult({ ok: true, msg: "Configuración guardada" });
  };

  const testConnection = async () => {
    setGasConfig({ url: gas.url.trim(), token: gas.token.trim() });
    setTesting(true);
    setTestResult(null);
    const r = await pingGas();
    setTesting(false);
    setTestResult(r);
  };

  const statusColor = syncStatus.status === "ok" ? C.jade
    : syncStatus.status === "syncing" ? C.amber
    : syncStatus.status === "error" ? C.ruby
    : C.mute;

  const statusLabel = syncStatus.status === "ok" ? "Sincronizado"
    : syncStatus.status === "syncing" ? "Sincronizando..."
    : syncStatus.status === "error" ? "Error de sync"
    : "Sin sincronizar";

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: C.raised, border: `1px solid ${C.line}` }}>
        {syncStatus.status === "syncing"
          ? <Loader2 size={16} className="animate-spin" style={{ color: statusColor }} />
          : syncStatus.status === "error"
          ? <CloudOff size={16} style={{ color: statusColor }} />
          : <Cloud size={16} style={{ color: statusColor }} />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: statusColor }}>{statusLabel}</div>
          {syncStatus.lastSync && (
            <div className="text-[10px]" style={{ color: C.mute }}>
              Última: {syncStatus.lastSync.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
            </div>
          )}
          {syncStatus.error && (
            <div className="text-[10px] truncate" style={{ color: C.ruby }}>{syncStatus.error}</div>
          )}
        </div>
      </div>

      <Field label="URL del Apps Script" value={gas.url} onChange={(v) => setGas({ ...gas, url: v })}
        placeholder="https://script.google.com/macros/s/AKf.../exec" />
      <Field label="Token secreto" value={gas.token} onChange={(v) => setGas({ ...gas, token: v })}
        placeholder="Token definido en el Apps Script" />

      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={saveConfig} icon={Save} variant="secondary">Guardar</Btn>
        <Btn onClick={testConnection} icon={testing ? Loader2 : Link} variant="primary" disabled={testing || !gas.url}>
          {testing ? "Probando..." : "Probar"}
        </Btn>
      </div>

      {testResult && (
        <div className="p-3 rounded-xl text-xs" style={{
          background: testResult.ok ? `${C.jade}15` : `${C.ruby}15`,
          border: `1px solid ${testResult.ok ? C.jade : C.ruby}55`,
          color: testResult.ok ? C.jade : C.ruby,
        }}>
          {testResult.ok ? "✓ " : "⚠ "}{testResult.msg || testResult.error || "Conexión OK"}
        </div>
      )}

      {gas.url && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Btn onClick={async () => {
            if (!confirm("¿Sobrescribir datos locales con los de la nube?")) return;
            const r = await syncPull();
            if (!r.ok) alert("Error: " + r.error);
          }} icon={Download} variant="ghost">Pull nube → local</Btn>
          <Btn onClick={async () => {
            const r = await syncPush();
            if (!r.ok) alert("Error: " + r.error);
          }} icon={Upload} variant="ghost">Push local → nube</Btn>
        </div>
      )}

      <div className="text-[10px] leading-relaxed pt-2" style={{ color: C.mute }}>
        <p>Los datos se sincronizan automáticamente 3s después de cada cambio. Las fotos suben en segundo plano.</p>
        <p className="mt-1">Configura tu Apps Script siguiendo las instrucciones del README (apps-script/Code.gs).</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// VIEW: SETTINGS / DATA
// ═══════════════════════════════════════════════════════════
const SettingsView = ({ state, dispatch, syncStatus, syncPush, syncPull }) => {
  const s = state.settings;
  const u = (k, v) => dispatch({ type: "UPDATE_SETTINGS", settings: { [k]: v } });

  const exportData = () => {
    const csv = [
      ["FECHA_COMPRA","FECHA_VENTA","MARCA","MODELO","MECANISMO","PROVEEDOR","COSTE_TOTAL_COMPRA","CANAL_VENTA","PRECIO_VENTA_RELOJ","ENVIO_COBRADO_CLIENTE","VENDIDO","FACTURA_NUMERO","CLIENTE","PAIS","ESTADO","LISTING_CHANNEL","LISTING_PRICE","DEVUELTO_FECHA"].join(","),
      ...state.watches.map(w => [
        w.purchase_date || "", w.sale_date || "",
        w.brand, w.model, w.mechanism, w.purchase_source,
        w.purchase_price, w.sale_channel || "",
        w.sale_price || "", w.sale_shipping || "",
        w.status === "sold" ? 1 : 0,
        w.factura_num || "", w.customer_name || "", w.customer_country || "",
        w.status, w.listing_channel || "", w.listing_price || "",
        w.returned_date || "",
      ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timelab_ops_${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Build KPIs
    const q2start = "2026-04-01";
    const sold = state.watches.filter(w => w.status === "sold" && w.sale_date >= q2start);
    const stock = state.watches.filter(w => w.status === "stock" || w.status === "listed");
    const revenue = sold.reduce((s, w) => s + (w.sale_price || 0) + (w.sale_shipping || 0), 0);
    const cost = sold.reduce((s, w) => s + (w.purchase_price || 0), 0);
    const commission = sold.reduce((sv, w) => {
      const rate = w.sale_channel === "Catawiki" ? s.catawiki_commission
        : w.sale_channel === "Chrono24" ? s.chrono24_commission
        : w.sale_channel === "Vinted" ? s.vinted_commission : 0;
      return sv + (w.sale_price || 0) * rate / 100 * 1.21;
    }, 0);
    const shipping = sold.length * s.envio_medio * 1.21;
    const profit = revenue - cost - commission - shipping;
    const gastos = state.expenses.reduce((s, e) => s + (e.total || 0), 0);
    const byBrand = {};
    sold.forEach(w => {
      if (!byBrand[w.brand]) byBrand[w.brand] = { ops: 0, profit: 0 };
      byBrand[w.brand].ops++;
      byBrand[w.brand].profit += (w.sale_price || 0) * 0.85 + 35 - (w.purchase_price || 0);
    });
    const topBrands = Object.entries(byBrand).sort((a, b) => b[1].profit - a[1].profit).slice(0, 8);
    const byChannel = {};
    sold.forEach(w => {
      if (!byChannel[w.sale_channel]) byChannel[w.sale_channel] = { ops: 0, revenue: 0 };
      byChannel[w.sale_channel].ops++;
      byChannel[w.sale_channel].revenue += w.sale_price || 0;
    });

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TIMELAB Informe 2T 2026</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: Georgia, serif; color: #2a2a2a; line-height: 1.5; }
  h1 { font-size: 28px; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 4px; }
  h2 { font-size: 16px; font-weight: 500; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .sub { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .kpi { border: 1px solid #ddd; padding: 10px; border-radius: 6px; }
  .kpi .l { font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #888; }
  .kpi .v { font-size: 20px; font-weight: 500; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
  th { font-weight: 500; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em; color: #888; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .footer { margin-top: 40px; font-size: 9px; color: #999; text-align: center; }
</style></head><body>
<div class="sub">Timelab Watches · Joseba Hidalgo · NIF 47467159N</div>
<h1>Informe 2T 2026</h1>
<div class="sub">Madrid · generado ${today()} · régimen ${s.fiscal_regime.toUpperCase()}</div>

<h2>Resumen operacional</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="l">Ventas 2T</div><div class="v">${sold.length}</div></div>
  <div class="kpi"><div class="l">Facturación</div><div class="v">€${revenue.toLocaleString("es-ES", {maximumFractionDigits:0})}</div></div>
  <div class="kpi"><div class="l">Beneficio</div><div class="v">€${profit.toLocaleString("es-ES", {maximumFractionDigits:0})}</div></div>
  <div class="kpi"><div class="l">Stock activo</div><div class="v">${stock.length}</div></div>
</div>

<h2>Performance por marca (Top 8)</h2>
<table><thead><tr><th>Marca</th><th>Ops</th><th class="num">Beneficio</th><th class="num">€/op</th></tr></thead>
<tbody>
${topBrands.map(([b, v]) => `<tr><td>${b}</td><td>${v.ops}</td><td class="num">€${v.profit.toFixed(0)}</td><td class="num">€${(v.profit/v.ops).toFixed(0)}</td></tr>`).join("")}
</tbody></table>

<h2>Performance por canal</h2>
<table><thead><tr><th>Canal</th><th>Ops</th><th class="num">Ingresos</th><th class="num">% del total</th></tr></thead>
<tbody>
${Object.entries(byChannel).map(([c, v]) => `<tr><td>${c}</td><td>${v.ops}</td><td class="num">€${v.revenue.toFixed(0)}</td><td class="num">${(v.ops/sold.length*100).toFixed(0)}%</td></tr>`).join("")}
</tbody></table>

<h2>Gastos generales 2T</h2>
<table><thead><tr><th>Fecha</th><th>Concepto</th><th>Proveedor</th><th class="num">Total</th></tr></thead>
<tbody>
${state.expenses.map(e => `<tr><td>${e.date}</td><td>${e.concept}</td><td>${e.provider}</td><td class="num">€${e.total.toFixed(2)}</td></tr>`).join("")}
<tr><td colspan="3" style="font-weight:500">TOTAL</td><td class="num" style="font-weight:500">€${gastos.toFixed(2)}</td></tr>
</tbody></table>

<h2>Stock pendiente</h2>
<table><thead><tr><th>Marca</th><th>Modelo</th><th>Compra</th><th>Días</th><th class="num">Coste</th></tr></thead>
<tbody>
${stock.sort((a,b) => daysBetween(b.purchase_date, today()) - daysBetween(a.purchase_date, today())).slice(0, 20).map(w => {
  const d = daysBetween(w.purchase_date, today());
  return `<tr><td>${w.brand}</td><td>${w.model||""}</td><td>${w.purchase_date}</td><td>${d}d</td><td class="num">€${(w.purchase_price||0).toFixed(2)}</td></tr>`;
}).join("")}
</tbody></table>

<div class="footer">Generado desde TIMELAB Atelier · timelab-atelier v3</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) { setTimeout(() => { try { w.print(); } catch {} }, 500); }
  };

  const regimeOptions = [
    { id: "autonomo_rebu", label: "Autónomo · REBU", desc: "Régimen actual: IVA sobre margen" },
    { id: "autonomo_general", label: "Autónomo · General", desc: "IVA sobre total" },
    { id: "sl_rebu", label: "SL · REBU", desc: "Sociedad con bienes usados" },
    { id: "sl_general", label: "SL · General", desc: "Sociedad con IS + IVA" },
  ];

  return (
    <div className="px-4 pb-24 pt-4 space-y-3">
      <h1 className="font-serif text-3xl pt-2" style={{ color: C.cream, fontFamily: "'Fraunces', serif", fontWeight: 300 }}>Ajustes</h1>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Cloud size={14} style={{ color: C.gold }} />
          <span className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Sincronización nube</span>
        </div>
        <SyncPanel syncStatus={syncStatus} syncPush={syncPush} syncPull={syncPull} />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Régimen fiscal</div>
        <div className="space-y-2">
          {regimeOptions.map(r => (
            <button key={r.id} onClick={() => u("fiscal_regime", r.id)}
              className="w-full text-left p-3 rounded-xl transition-all"
              style={{
                background: s.fiscal_regime === r.id ? `${C.gold}15` : C.raised,
                border: `1px solid ${s.fiscal_regime === r.id ? C.gold : C.line}`
              }}>
              <div className="flex items-center gap-2">
                {s.fiscal_regime === r.id ? <CheckCircle2 size={14} style={{ color: C.gold }} /> : <CircleDot size={14} style={{ color: C.mute }} />}
                <span className="text-sm font-semibold" style={{ color: s.fiscal_regime === r.id ? C.gold : C.cream }}>{r.label}</span>
              </div>
              <div className="text-xs ml-6 mt-0.5" style={{ color: C.mute }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Fiscalidad</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="IVA (%)" type="number" value={s.iva_rate} onChange={(v) => u("iva_rate", v)} />
          <Field label="IRPF (%)" type="number" value={s.irpf_rate} onChange={(v) => u("irpf_rate", v)} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Comisiones canal</div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Catawiki %" type="number" value={s.catawiki_commission} onChange={(v) => u("catawiki_commission", v)} />
          <Field label="Chrono24 %" type="number" value={s.chrono24_commission} onChange={(v) => u("chrono24_commission", v)} />
          <Field label="Vinted %" type="number" value={s.vinted_commission} onChange={(v) => u("vinted_commission", v)} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Objetivos</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ROI mínimo (%)" type="number" value={s.target_roi_min} onChange={(v) => u("target_roi_min", v)} />
          <Field label="Beneficio mín (€)" type="number" value={s.target_profit_min} onChange={(v) => u("target_profit_min", v)} />
          <Field label="Ticket objetivo (€)" type="number" value={s.target_ticket} onChange={(v) => u("target_ticket", v)} />
          <Field label="Envío real medio (€)" type="number" value={s.envio_medio} onChange={(v) => u("envio_medio", v)} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Umbrales stock añejo (días)</div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Aviso" type="number" value={s.aged_threshold_soft} onChange={(v) => u("aged_threshold_soft", v)} />
          <Field label="Alerta" type="number" value={s.aged_threshold_hard} onChange={(v) => u("aged_threshold_hard", v)} />
          <Field label="Crítico" type="number" value={s.aged_threshold_critical} onChange={(v) => u("aged_threshold_critical", v)} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Diagnóstico fotos</div>
        <PhotoDiagnostic state={state} />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-xs tracking-widest uppercase font-bold" style={{ color: C.mute }}>Exportar</div>
        <Btn onClick={exportPDF} icon={FileDown} variant="primary" full>Informe trimestral (PDF)</Btn>
        <Btn onClick={exportData} icon={Download} variant="secondary" full>CSV operaciones</Btn>
        <Btn onClick={() => {
          if (confirm("¿Restablecer datos semilla? Se perderán los cambios locales.")) {
            dispatch({ type: "RESET_SEED" });
          }
        }} icon={Archive} variant="ghost" full>Restablecer datos 2T</Btn>
      </Card>

      <Card className="p-4">
        <div className="text-xs tracking-widest uppercase font-bold mb-3" style={{ color: C.mute }}>Estado</div>
        <div className="space-y-1.5 text-sm">
          <Row label="Relojes totales" value={state.watches.length} />
          <Row label="En stock" value={state.watches.filter(w => w.status === "stock").length} />
          <Row label="Publicados" value={state.watches.filter(w => w.status === "listed").length} />
          <Row label="Vendidos" value={state.watches.filter(w => w.status === "sold").length} />
          <Row label="Devueltos" value={state.watches.filter(w => w.status === "returned").length} />
          <Row label="Perdidos" value={state.watches.filter(w => w.status === "lost").length} />
          <Row label="Oportunidades" value={state.opportunities.length} />
          <Row label="Comparables" value={state.price_comps.length} />
          <Row label="Gastos generales" value={(state.expenses || []).length} />
          <Row label="Notas cliente" value={(state.customer_notes || []).length} />
        </div>
      </Card>

      <div className="text-center pt-4 pb-2">
        <div className="font-serif text-sm" style={{ color: C.gold, fontFamily: "'Fraunces', serif", letterSpacing: "0.1em" }}>TIMELAB ATELIER</div>
        <div className="text-[10px] tracking-widest uppercase mt-1" style={{ color: C.mute }}>v3.0 · 2T 2026 · Full CRM</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// BOTTOM NAVIGATION
// ═══════════════════════════════════════════════════════════
const BottomNav = ({ view, setView }) => {
  const items = [
    { id: "dashboard", icon: Home, label: "Inicio" },
    { id: "stock", icon: Package, label: "Stock" },
    { id: "opportunities", icon: Target, label: "Ofertas" },
    { id: "customers", icon: Users, label: "Clientes" },
    { id: "comps", icon: TrendingUp, label: "Comps" },
    { id: "settings", icon: Settings, label: "Ajustes" },
  ];
  const active = view.name;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-2 pb-2 pt-2" style={{
      background: `linear-gradient(to top, ${C.ink} 70%, transparent)`,
      zIndex: 50
    }}>
      <div className="flex items-center justify-around rounded-2xl p-1.5" style={{
        background: C.coal,
        border: `1px solid ${C.line}`,
        boxShadow: `0 -4px 20px rgba(0,0,0,0.5)`
      }}>
        {items.map(it => {
          const isActive = active === it.id ||
                           (it.id === "stock" && ["add-watch", "edit-watch", "watch-detail", "sell-watch", "listing"].includes(active)) ||
                           (it.id === "customers" && active === "customer-detail") ||
                           (it.id === "dashboard" && active === "expenses");
          return (
            <button key={it.id} onClick={() => setView({ name: it.id })}
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all flex-1"
              style={{
                background: isActive ? `${C.gold}15` : "transparent",
                color: isActive ? C.gold : C.mute
              }}>
              <it.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[9px] font-semibold tracking-wide mt-0.5">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [view, setView] = useState({ name: "dashboard" });
  const [syncStatus, setSyncStatus] = useState({ status: "idle", error: null, lastSync: getLastSync() });

  // Sync: push local state to Apps Script
  const syncPush = useCallback(async () => {
    const { url } = getGasConfig();
    if (!url) return { ok: false, error: "no_config" };
    setSyncStatus({ status: "syncing", error: null, lastSync: getLastSync() });
    try {
      await pushToGas({
        watches: state.watches,
        opportunities: state.opportunities,
        price_comps: state.price_comps,
        expenses: state.expenses,
        customer_notes: state.customer_notes,
        settings: state.settings,
      });
      setLastSync(new Date());
      await drainQueue();
      setSyncStatus({ status: "ok", error: null, lastSync: new Date() });
      return { ok: true };
    } catch (e) {
      setSyncStatus({ status: "error", error: e.message, lastSync: getLastSync() });
      return { ok: false, error: e.message };
    }
  }, [state]);

  // Sync: pull remote state and replace local
  const syncPull = useCallback(async () => {
    const { url } = getGasConfig();
    if (!url) return { ok: false, error: "no_config" };
    setSyncStatus({ status: "syncing", error: null, lastSync: getLastSync() });
    try {
      const remote = await pullFromGas();
      if (remote && remote.watches) {
        dispatch({ type: "LOAD", payload: { ...remote, loaded: true } });
        setLastSync(new Date());
        setSyncStatus({ status: "ok", error: null, lastSync: new Date() });
        return { ok: true };
      }
      setSyncStatus({ status: "error", error: "empty_remote", lastSync: getLastSync() });
      return { ok: false, error: "empty_remote" };
    } catch (e) {
      setSyncStatus({ status: "error", error: e.message, lastSync: getLastSync() });
      return { ok: false, error: e.message };
    }
  }, []);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        // Try Apps Script first if configured
        const { url } = getGasConfig();
        if (url) {
          try {
            const remote = await pullFromGas();
            if (remote && remote.watches) {
              dispatch({ type: "LOAD", payload: { ...remote, loaded: true } });
              setLastSync(new Date());
              setSyncStatus({ status: "ok", error: null, lastSync: new Date() });
              return;
            }
          } catch (e) {
            console.warn("[initial pull failed, falling back to local]", e.message);
            setSyncStatus({ status: "error", error: e.message, lastSync: getLastSync() });
          }
        }
        // Fallback to local
        const res = await window.storage.get("timelab_state_v4");
        if (res && res.value) {
          dispatch({ type: "LOAD", payload: JSON.parse(res.value) });
        } else {
          dispatch({ type: "RESET_SEED" });
        }
      } catch {
        dispatch({ type: "RESET_SEED" });
      }
    })();
  }, []);

  // Persist on change (local always, remote debounced)
  useEffect(() => {
    if (!state.loaded) return;
    (async () => {
      try {
        await window.storage.set("timelab_state_v4", JSON.stringify({
          watches: state.watches,
          opportunities: state.opportunities,
          price_comps: state.price_comps,
          expenses: state.expenses,
          customer_notes: state.customer_notes,
          settings: state.settings,
        }));
      } catch (e) { console.warn("Storage error:", e); }
    })();
  }, [state.watches, state.opportunities, state.price_comps, state.expenses, state.customer_notes, state.settings, state.loaded]);

  // Debounced remote push (3s after last change)
  useEffect(() => {
    if (!state.loaded) return;
    const { url } = getGasConfig();
    if (!url) return;
    const timer = setTimeout(() => { syncPush(); }, 3000);
    return () => clearTimeout(timer);
  }, [state.watches, state.opportunities, state.price_comps, state.expenses, state.customer_notes, state.settings, state.loaded, syncPush]);

  if (!state.loaded) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{
              background: `radial-gradient(circle, ${C.gold}33 0%, transparent 70%)`,
              border: `1px solid ${C.gold}`
            }}>
              <Watch size={24} style={{ color: C.gold }} />
            </div>
            <div className="font-serif text-lg" style={{ color: C.cream, fontFamily: "'Fraunces', serif" }}>TIMELAB</div>
            <div className="text-[10px] tracking-widest uppercase mt-1" style={{ color: C.mute }}>Cargando atelier...</div>
          </div>
        </div>
      </Shell>
    );
  }

  const renderView = () => {
    switch (view.name) {
      case "dashboard": return <Dashboard state={state} setView={setView} syncStatus={syncStatus} />;
      case "stock": return <StockView state={state} setView={setView} filter={view.filter} />;
      case "watch-detail": return <WatchDetail state={state} dispatch={dispatch} id={view.id} setView={setView} />;
      case "add-watch": return <WatchForm state={state} dispatch={dispatch} setView={setView} />;
      case "edit-watch": return <WatchForm state={state} dispatch={dispatch} editId={view.id} setView={setView} />;
      case "sell-watch": return <SellView state={state} dispatch={dispatch} id={view.id} setView={setView} />;
      case "listing": return <ListingView state={state} id={view.id} setView={setView} />;
      case "opportunities": return <OpportunitiesView state={state} dispatch={dispatch} setView={setView} />;
      case "customers": return <CustomersView state={state} setView={setView} />;
      case "customer-detail": return <CustomerDetailView state={state} dispatch={dispatch} customerName={view.customer} setView={setView} />;
      case "comps": return <CompsView state={state} dispatch={dispatch} setView={setView} />;
      case "expenses": return <ExpensesView state={state} dispatch={dispatch} setView={setView} />;
      case "settings": return <SettingsView state={state} dispatch={dispatch} syncStatus={syncStatus} syncPush={syncPush} syncPull={syncPull} />;
      default: return <Dashboard state={state} setView={setView} />;
    }
  };

  return (
    <Shell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Manrope:wght@400;500;600;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        body { background: ${C.ink}; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        select option { background: ${C.raised}; color: ${C.cream}; }
      `}</style>
      <div className="max-w-md mx-auto min-h-screen relative">
        {renderView()}
        <BottomNav view={view} setView={setView} />
      </div>
    </Shell>
  );
}
