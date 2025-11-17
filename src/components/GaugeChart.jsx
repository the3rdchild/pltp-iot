
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../assets/gauge-chart.css';
import MainCard from './MainCard';
import { Typography, Box, Link } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

const GaugeChart = ({
  label,
  value,
  min, 
  max,
  unit,
  linkTo,
  titleConfig,
  warningLow,
  warningHigh,
}) => {
  const gaugeRef = useRef(null);
  const chartId = useRef(`gauge-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    const config = {
      value,
      min,
      max,
      startAngleDeg: -187,
      endAngleDeg: 0,
      outer: {
        strokeWidth: 60,
        segments: 21,
        gapRatio: 0.80,
        gradientStops: [
          { offset: '0%', color: '#ff4d4d' },
          { offset: '45%', color: '#ffc14d' },
          { offset: '100%', color: '#2CB34A' },
        ],
      },
      inner: {
        strokeWidth: 30,
        segments: 21,
        gapRatio: 0.85,
        color: '#141515',
      },
      radius: 360,
      center: { x: 500, y: 500 },
    };

    const deg2rad = (d) => (d * Math.PI) / 180;

    const polarToCartesian = (cx, cy, r, angleInDegrees) => {
      const angleInRadians = deg2rad(angleInDegrees);
      return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians),
      };
    };

    const describeArc = (cx, cy, r, startAngle, endAngle) => {
      const start = polarToCartesian(cx, cy, r, endAngle);
      const end = polarToCartesian(cx, cy, r, startAngle);
      const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
      return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    };

    const renderGauge = (cfg) => {
      const gaugeEl = gaugeRef.current;
      if (!gaugeEl) return;

      const svg = gaugeEl.querySelector(`.gsvg`);
      const innerPath = gaugeEl.querySelector(`.inner-arc`);
      const outerPath = gaugeEl.querySelector(`.outer-arc`);
      const outerGlow = gaugeEl.querySelector(`.outer-glow`);
      const ticksGroup = gaugeEl.querySelector(`.ticks`);
      const pinEl = gaugeEl.querySelector(`.pin`);
      const valueText = gaugeEl.querySelector(`.value-text`);
      const unitText = gaugeEl.querySelector(`.unit`);
      const statusPill = gaugeEl.querySelector(`.status-pill`);

      const cx = cfg.center.x;
      const cy = cfg.center.y;
      const rOuter = cfg.radius;
      const rInner = cfg.radius - 70;

      const dOuter = describeArc(cx, cy, rOuter, cfg.startAngleDeg, cfg.endAngleDeg);
      const dInner = describeArc(cx, cy, rInner, cfg.startAngleDeg, cfg.endAngleDeg);

      outerPath.setAttribute('d', dOuter);
      outerPath.setAttribute('stroke-width', cfg.outer.strokeWidth);

      //hide outer glow
      // outerGlow.setAttribute('d', dOuter);
      // outerGlow.setAttribute('stroke-width', cfg.outer.strokeWidth + 8);

      innerPath.setAttribute('d', dInner);
      innerPath.setAttribute('stroke-width', cfg.inner.strokeWidth);
      innerPath.setAttribute('stroke', cfg.inner.color);

      const totalAngleDeg = Math.abs(cfg.endAngleDeg - cfg.startAngleDeg);
      const arcLengthOuter = (Math.PI * 2 * rOuter * totalAngleDeg) / 360;
      const arcLengthInner = (Math.PI * 2 * rInner * totalAngleDeg) / 360;

      const outerSegments = cfg.outer.segments;
      const outerSegLen = arcLengthOuter / outerSegments;
      const outerGap = outerSegLen * cfg.outer.gapRatio;
      const outerStrokeLen = Math.max(outerSegLen - outerGap, 1);
      outerPath.setAttribute('stroke-dasharray', `${outerStrokeLen} ${outerGap}`);

      const innerSegments = cfg.inner.segments;
      const innerSegLen = arcLengthInner / innerSegments;
      const innerGap = innerSegLen * cfg.inner.gapRatio;
      const innerStrokeLen = Math.max(innerSegLen - innerGap, 1);
      innerPath.setAttribute('stroke-dasharray', `${innerStrokeLen} ${innerGap}`);

      ticksGroup.innerHTML = '';
      const majorCount = 7;
      for (let i = 0; i < majorCount; i++) {
        const tAngle = cfg.startAngleDeg + (i / (majorCount - 1)) * (cfg.endAngleDeg - cfg.startAngleDeg);
        const p1 = polarToCartesian(cx, cy, rInner - 24, tAngle);
        const p2 = polarToCartesian(cx, cy, rInner + 18, tAngle);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.setAttribute('class', 'tick');
        line.setAttribute('stroke-width', 4);
        ticksGroup.appendChild(line);
      }

      const grad = gaugeEl.querySelector(`.outer-grad`);
      while (grad.firstChild) grad.removeChild(grad.firstChild);
      (cfg.outer.gradientStops || []).forEach((s) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', s.offset);
        stop.setAttribute('stop-color', s.color);
        grad.appendChild(stop);
      });

      const v = Math.min(Math.max(cfg.value, cfg.min), cfg.max);
      const ratio = (v - cfg.min) / (cfg.max - cfg.min);
      const angle = cfg.startAngleDeg + ratio * (cfg.endAngleDeg - cfg.startAngleDeg);
      const pos = polarToCartesian(cx, cy, rOuter + 80, angle);

      const gaugeRect = gaugeEl.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      gaugeEl.style.setProperty('--gauge-w', `${svgRect.width}px`);

      const vb = { w: 1000, h: 620 };
      const px = svgRect.left + (pos.x / vb.w) * svgRect.width;
      const py = svgRect.top + (pos.y / vb.h) * svgRect.height;

      pinEl.style.display = 'block';
      pinEl.style.left = `${px - gaugeRect.left}px`;
      pinEl.style.top = `${py - gaugeRect.top}px`;

      const lastColor =
        (cfg.outer.gradientStops && cfg.outer.gradientStops.slice(-1)[0])
          ? cfg.outer.gradientStops.slice(-1)[0].color
          : '#2CB34A';
      pinEl.querySelector('.dot').style.background = lastColor;

      valueText.textContent = (Math.round(cfg.value * 10) / 10).toFixed(1);
      unitText.textContent = unit;

      if (value < warningLow) {
        statusPill.textContent = 'Low';
        statusPill.style.background = '#fdecec';
        statusPill.style.color = '#e24c4c';
      } else if (value <= warningHigh) {
        statusPill.textContent = 'Normal';
        statusPill.style.background = '#eaf9ef';
        statusPill.style.color = '#2CB34A';
      } else {
        statusPill.textContent = 'High';
        statusPill.style.background = '#fff5e6';
        statusPill.style.color = '#ff9f1c';
      }
    };

    renderGauge(config);

    const onResize = () => {
      renderGauge(config);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [value, min, max, unit, warningLow, warningHigh]);

  const defaultTitleStyles = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'text.secondary',
    justifyContent: 'flex-start'
  };

  const titleStyles = { ...defaultTitleStyles, ...titleConfig };

  return (
    <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: titleStyles.justifyContent, mb: 0.5, flexShrink: 0 }}>
          <Link href={linkTo} target="_blank" rel="noopener noreferrer" underline={linkTo ? 'hover' : 'none'} color="inherit">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={titleStyles}>{label}</Typography>
              {linkTo && <LaunchIcon sx={{ fontSize: '0.8rem', color: 'text.secondary' }} />}
            </Box>
          </Link>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0 }}>
            <div className="gauge" ref={gaugeRef}>
                <svg className="gsvg" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={`outerGrad-${chartId}`} className="outer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff4d4d" />
                    <stop offset="50%" stopColor="#ffd54d" />
                    <stop offset="100%" stopColor="#2CB34A" />
                    </linearGradient>
                </defs>
                <path className="inner-arc" fill="none" strokeWidth="18" strokeDasharray="1 8" strokeLinecap="butt" />
                <path className="outer-arc" fill="none" strokeWidth="26" stroke={`url(#outerGrad-${chartId})`} />
                <path className="outer-glow" fill="none" stroke={`url(#outerGrad-${chartId})`} strokeWidth="32" opacity="0.5" />
                <g className="ticks"></g>
                </svg>
                <div className="center" aria-hidden="true">
                <div className="value">
                    <span className="value-text">0.0</span>
                    <span className="unit">%</span>
                </div>
                <div className="status-pill">
                    Loading...
                </div>
                </div>
                <div className="pin" style={{ display: 'none' }}>
                <div className="dot"></div>
                </div>
            </div>
        </Box>
    </MainCard>
  );
};

GaugeChart.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  unit: PropTypes.string,
  linkTo: PropTypes.string,
  titleConfig: PropTypes.object,
  warningLow: PropTypes.number,
  warningHigh: PropTypes.number
};

GaugeChart.defaultProps = {
    unit: ''
}

export default GaugeChart;
