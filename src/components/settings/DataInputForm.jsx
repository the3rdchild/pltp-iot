// components/settings/DataInputForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  Stack
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// reference mockup path (local file you uploaded)
const MOCKUP_PATH = '/mnt/data/1f10e2d7-6b71-4b11-bec0-1c6740e73f52.png';

function pad(n, digits = 2) {
  return String(n).padStart(digits, '0');
}

function toDatetimeLocalValue(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

function parseCustomFormatToDate(str) {
  // Interpret custom: DD:MM:YY-hh:mm:ss
  if (!str) return null;
  const parts = str.trim().split('-');
  if (parts.length === 2) {
    const dateParts = parts[0].split(':');
    const timeParts = parts[1].split(':');
    if (dateParts.length === 3 && timeParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const yearTwo = parseInt(dateParts[2], 10);
      const year = 2000 + yearTwo;
      const hh = parseInt(timeParts[0], 10);
      const mm = parseInt(timeParts[1], 10);
      const ss = parseInt(timeParts[2], 10);
      const d = new Date(year, month, day, hh, mm, ss);
      if (!isNaN(d.getTime())) return d;
    }
  }
  // fallback: try Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) return new Date(parsed);
  return null;
}

function formatDateToCustom(date) {
  if (!date) return '';
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = pad(date.getFullYear() % 100, 2);
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${day}:${month}:${year}-${hh}:${mm}:${ss}`;
}

export default function DataInputForm({ title, subtitle, mockupUrl }) {
  const [form, setForm] = useState({
    pressure: '',
    temperature: '',
    flow: '',
    tds: '',
    ncg: '',
    p1: '',
    p2: '',
    t1: '',
    t2: '',
    dateObj: null,
    customDateStr: ''
  });

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // allow empty or numeric + decimals
    if (value === '' || /^-?\d*(?:[.,]\d*)?$/.test(value)) {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleDateTimeLocalChange = (e) => {
    const v = e.target.value; // YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS
    if (!v) {
      setForm((p) => ({ ...p, dateObj: null, customDateStr: '' }));
      return;
    }
    let iso = v;
    // if browser gives YYYY-MM-DDTHH:MM (length 16), append :00 seconds
    if (v.length === 16) iso = `${v}:00`;
    const parsed = new Date(iso);
    if (!isNaN(parsed.getTime())) {
      setForm((p) => ({ ...p, dateObj: parsed, customDateStr: formatDateToCustom(parsed) }));
    }
  };

  const handleCustomDateChange = (e) => {
    const v = e.target.value;
    setForm((p) => ({ ...p, customDateStr: v }));
    const parsed = parseCustomFormatToDate(v);
    if (parsed) {
      setForm((p) => ({ ...p, dateObj: parsed, customDateStr: v }));
    }
  };

  const handleSave = () => {
    const payload = {
      pressure: form.pressure,
      temperature: form.temperature,
      flow: form.flow,
      tds: form.tds,
      ncg: form.ncg,
      p1: form.p1,
      p2: form.p2,
      t1: form.t1,
      t2: form.t2,
      timestamp: form.dateObj ? form.dateObj.toISOString() : null,
      customDateDisplay: form.customDateStr
    };
    console.log('Saving manual lab input ->', payload);
    alert('Saved (console.log) — ganti dengan logic API/Firestore Anda');
  };

  return (
    <Card sx={{ borderRadius: 2 }} elevation={1}>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6">{title ?? 'Form Input Data Lab'}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle ?? 'Setting input data lab secara manual'}</Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" variant="outlined" label="Pressure (Barg)" name="pressure" value={form.pressure} onChange={handleNumberChange} />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" variant="outlined" label="Temperature (°C)" name="temperature" value={form.temperature} onChange={handleNumberChange} />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" variant="outlined" label="Flow (t/h)" name="flow" value={form.flow} onChange={handleNumberChange} />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" variant="outlined" label="TDS (ppm)" name="tds" value={form.tds} onChange={handleNumberChange} />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField fullWidth size="small" variant="outlined" label="NCG" name="ncg" value={form.ncg} onChange={handleNumberChange} />
          </Grid>

          <Grid item xs={12} md={12} />

          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" gutterBottom>Dryness (%)</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {/* Pill-like editable inputs */}
              <TextField size="small" variant="outlined" name="p1" value={form.p1} onChange={handleNumberChange} placeholder="P1 (bar)" InputProps={{ sx: { borderRadius: '999px', padding: '6px 12px' } }} sx={{ width: 140 }} />
              <TextField size="small" variant="outlined" name="p2" value={form.p2} onChange={handleNumberChange} placeholder="P2 (bar)" InputProps={{ sx: { borderRadius: '999px', padding: '6px 12px' } }} sx={{ width: 140 }} />
              <TextField size="small" variant="outlined" name="t1" value={form.t1} onChange={handleNumberChange} placeholder="T1 (°C)" InputProps={{ sx: { borderRadius: '999px', padding: '6px 12px' } }} sx={{ width: 140 }} />
              <TextField size="small" variant="outlined" name="t2" value={form.t2} onChange={handleNumberChange} placeholder="T2 (°C)" InputProps={{ sx: { borderRadius: '999px', padding: '6px 12px' } }} sx={{ width: 140 }} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" gap={2}>
              
              <TextField 
              size="small" 
              type="datetime-local" 
              name="datetimeLocal" 
              value={toDatetimeLocalValue(form.dateObj)} 
              onChange={handleDateTimeLocalChange} 
              InputLabelProps={{ shrink: true }} 
              sx={{ minWidth: 260 }} 
              inputProps={{ step: 1 }} 
              helperText="YYYY-MM-DD HH:MM:SS" />

              <TextField 
              size="small" 
              label="Custom format" 
              placeholder="DD:MM:YY-hh:mm:ss" 
              value={form.customDateStr} onChange={handleCustomDateChange} 
              helperText=" " 
              // helperText="DD:MM:YY-hh:mm:ss" 
              sx={{ minWidth: 220 }} />

              <Button variant="contained" size="medium" onClick={handleSave} sx={{ minWidth: 120 }}>Save</Button>
            </Box>
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  );
}
