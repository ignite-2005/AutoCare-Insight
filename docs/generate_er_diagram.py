import os
from render_helper import render_html_to_jpeg, docs_dir, db_dir

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AutoCare Insight — Entity-Relationship (ER) Diagram</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      width: 3600px;
      height: 2450px;
      overflow: hidden;
      position: relative;
    }

    /* Top Banner */
    .banner {
      width: 100%;
      height: 130px;
      background: linear-gradient(135deg, #1e1b4b 0%, #1e293b 50%, #0f172a 100%);
      border-bottom: 3px solid #3b82f6;
      padding: 24px 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner-title h1 {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .banner-title h1 span.badge {
      font-size: 14px;
      font-weight: 700;
      background: #2563eb;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .banner-title p {
      font-size: 16px;
      color: #94a3b8;
      margin-top: 6px;
    }
    .banner-meta {
      display: flex;
      gap: 30px;
      align-items: center;
    }
    .meta-box {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid #334155;
      padding: 10px 18px;
      border-radius: 8px;
      text-align: right;
    }
    .meta-box .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .meta-box .val { font-size: 15px; color: #38bdf8; font-weight: 700; }

    /* Legend Bar */
    .legend-bar {
      width: 100%;
      height: 60px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 60px;
      font-size: 13px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #cbd5e1;
    }
    .legend-box {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }
    .tag-pk { background: #eab308; color: #000; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 3px; }
    .tag-fk { background: #38bdf8; color: #000; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 3px; }
    .tag-uk { background: #a855f7; color: #fff; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 3px; }
    .cardinality-badge { background: #334155; border: 1px solid #64748b; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 11px; color: #f1f5f9; }

    /* Diagram Canvas */
    .canvas-container {
      position: absolute;
      top: 190px;
      left: 0;
      width: 3600px;
      height: 2260px;
    }

    svg.connections {
      position: absolute;
      top: 0;
      left: 0;
      width: 3600px;
      height: 2260px;
      pointer-events: none;
      z-index: 1;
    }

    /* Entity Table Cards */
    .entity-card {
      position: absolute;
      background: #1e293b;
      border: 2px solid #334155;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      z-index: 2;
      overflow: hidden;
      font-size: 12.5px;
    }
    .entity-header {
      padding: 10px 16px;
      font-weight: 700;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      letter-spacing: 0.5px;
    }
    .entity-header span.tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Color Categories */
    .cat-users .entity-header { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; }
    .cat-customers .entity-header { background: linear-gradient(135deg, #0f766e, #0d9488); color: #fff; }
    .cat-catalogue .entity-header { background: linear-gradient(135deg, #4338ca, #6366f1); color: #fff; }
    .cat-vehicles .entity-header { background: linear-gradient(135deg, #0369a1, #0284c7); color: #fff; }
    .cat-services .entity-header { background: linear-gradient(135deg, #047857, #10b981); color: #fff; }
    .cat-appointments .entity-header { background: linear-gradient(135deg, #b45309, #d97706); color: #fff; }
    .cat-jobs .entity-header { background: linear-gradient(135deg, #c2410c, #ea580c); color: #fff; }
    .cat-parts .entity-header { background: linear-gradient(135deg, #be123c, #e11d48); color: #fff; }
    .cat-usage .entity-header { background: linear-gradient(135deg, #9f1239, #f43f5e); color: #fff; }
    .cat-invoices .entity-header { background: linear-gradient(135deg, #6b21a8, #9333ea); color: #fff; }
    .cat-payments .entity-header { background: linear-gradient(135deg, #581c87, #7e22ce); color: #fff; }
    .cat-reminders .entity-header { background: linear-gradient(135deg, #374151, #4b5563); color: #fff; }
    .cat-mongo {
      border: 2px dashed #22c55e !important;
    }
    .cat-mongo .entity-header { background: linear-gradient(135deg, #14532d, #16a34a); color: #fff; }

    .attr-table {
      width: 100%;
      border-collapse: collapse;
      background: #1e293b;
    }
    .attr-table tr {
      border-bottom: 1px solid #334155;
    }
    .attr-table tr:last-child {
      border-bottom: none;
    }
    .attr-table tr:hover {
      background: #273549;
    }
    .attr-table td {
      padding: 4.5px 12px;
      font-size: 12px;
      vertical-align: middle;
    }
    .attr-key {
      width: 44px;
      text-align: center;
    }
    .attr-name {
      font-weight: 500;
      color: #e2e8f0;
      font-family: "Cascadia Code", "Consolas", monospace;
    }
    .attr-pk {
      font-weight: 700;
      color: #fde047;
      text-decoration: underline;
    }
    .attr-fk {
      font-style: italic;
      color: #7dd3fc;
    }
    .attr-type {
      text-align: right;
      color: #94a3b8;
      font-size: 11px;
      font-family: "Cascadia Code", "Consolas", monospace;
    }

    /* Relationship Diamond Labels */
    .rel-badge {
      font-size: 11px;
      font-weight: 700;
      fill: #ffffff;
      text-anchor: middle;
      dominant-baseline: central;
    }
    .rel-diamond {
      fill: #1e293b;
      stroke: #60a5fa;
      stroke-width: 2px;
    }
    .rel-card {
      font-size: 12px;
      font-weight: 800;
      fill: #38bdf8;
      text-anchor: middle;
      dominant-baseline: central;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="banner">
    <div class="banner-title">
      <h1>
        AutoCare Insight &mdash; Entity-Relationship (ER) Diagram
        <span class="badge">PES University Level-3 DBMS</span>
      </h1>
      <p>Formal Dual-Database Relational + Document Architecture (13 MySQL 8.0 InnoDB Tables &bull; 1 MongoDB 8.2 Collection &bull; 20 Strict Cardinality Constraints)</p>
    </div>
    <div class="banner-meta">
      <div class="meta-box">
        <div class="label">Architecture Model</div>
        <div class="val">Hybrid Relational-Document</div>
      </div>
      <div class="meta-box">
        <div class="label">Relational Storage</div>
        <div class="val">MySQL 8.0 (ACID InnoDB)</div>
      </div>
      <div class="meta-box">
        <div class="label">Document Storage</div>
        <div class="val">MongoDB 8.2 (Polymorphic)</div>
      </div>
      <div class="meta-box">
        <div class="label">Specification Version</div>
        <div class="val">v1.4 Production Final</div>
      </div>
    </div>
  </div>

  <!-- Legend Bar -->
  <div class="legend-bar">
    <div class="legend-item">
      <span class="tag-pk">PK</span> <strong>Primary Key (Unique, Non-Null, Clustered Index)</strong>
    </div>
    <div class="legend-item">
      <span class="tag-fk">FK</span> <strong>Foreign Key (Referential Integrity Constraint)</strong>
    </div>
    <div class="legend-item">
      <span class="tag-uk">UK</span> <strong>Unique Key (Candidate Key Constraint)</strong>
    </div>
    <div class="legend-item">
      <span class="cardinality-badge">1 : 1</span> <strong>One-to-One Relationship</strong>
    </div>
    <div class="legend-item">
      <span class="cardinality-badge">1 : N</span> <strong>One-to-Many Relationship</strong>
    </div>
    <div class="legend-item">
      <span class="cardinality-badge">M : N</span> <strong>Many-to-Many (via Associative Bridge)</strong>
    </div>
    <div class="legend-item">
      <span style="display:inline-block; width:22px; height:2px; background:#38bdf8; vertical-align:middle;"></span>
      <strong>Solid: MySQL Foreign Key</strong>
    </div>
    <div class="legend-item">
      <span style="display:inline-block; width:22px; height:2px; border-top:2px dashed #22c55e; vertical-align:middle;"></span>
      <strong>Dashed: Cross-Engine Hybrid Link (MySQL &harr; MongoDB)</strong>
    </div>
  </div>

  <div class="canvas-container">

    <!-- SVG CONNECTIONS LAYER -->
    <svg class="connections" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Arrowhead Marker -->
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e" />
        </marker>
        <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
        <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
        </marker>
      </defs>

      <!-- 1. CUSTOMERS -> CUSTOMER_VEHICLES (1:N) -->
      <!-- From (860, 590) to (1180, 750) -->
      <path d="M 860 590 L 860 670 L 1180 670 L 1180 750" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="1020,655 1065,670 1020,685 975,670" class="rel-diamond" />
      <text x="1020" y="670" class="rel-badge">OWNS</text>
      <text x="880" y="615" class="rel-card">1</text>
      <text x="1200" y="735" class="rel-card">N</text>

      <!-- 2. VEHICLE_CATALOGUE -> CUSTOMER_VEHICLES (1:N) -->
      <!-- From (1550, 630) to (1320, 750) -->
      <path d="M 1550 630 L 1550 690 L 1320 690 L 1320 750" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="1435,675 1480,690 1435,705 1390,690" class="rel-diamond" />
      <text x="1435" y="690" class="rel-badge">CATALOGS</text>
      <text x="1570" y="650" class="rel-card">1</text>
      <text x="1340" y="735" class="rel-card">N</text>

      <!-- 3. CUSTOMERS -> APPOINTMENTS (1:N) -->
      <!-- From (760, 590) to (560, 750) -->
      <path d="M 760 590 L 760 670 L 560 670 L 560 750" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="660,655 705,670 660,685 615,670" class="rel-diamond" />
      <text x="660" y="670" class="rel-badge">BOOKS</text>
      <text x="780" y="615" class="rel-card">1</text>
      <text x="580" y="735" class="rel-card">N</text>

      <!-- 4. CUSTOMER_VEHICLES -> APPOINTMENTS (1:N) -->
      <!-- From (1000, 890) to (770, 890) -->
      <path d="M 1000 890 L 770 890" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="885,875 930,890 885,905 840,890" class="rel-diamond" />
      <text x="885" y="890" class="rel-badge">SCHEDULED</text>
      <text x="980" y="875" class="rel-card">1</text>
      <text x="795" y="875" class="rel-card">N</text>

      <!-- 5. USERS (Advisor) -> APPOINTMENTS (1:N) -->
      <!-- From (250, 560) to (350, 860) -->
      <path d="M 250 560 L 250 860 L 350 860" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="250,715 295,730 250,745 205,730" class="rel-diamond" />
      <text x="250" y="730" class="rel-badge">ADVISES</text>
      <text x="270" y="580" class="rel-card">1</text>
      <text x="330" y="845" class="rel-card">N</text>

      <!-- 6. APPOINTMENTS -> SERVICE_JOBS (1:0..1) -->
      <!-- From (770, 1050) to (1400, 1340) -->
      <path d="M 770 1050 L 930 1050 L 930 1340 L 1400 1340" fill="none" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-amber)" />
      <polygon points="1135,1325 1185,1340 1135,1355 1085,1340" class="rel-diamond" style="stroke:#f59e0b;" />
      <text x="1135" y="1340" class="rel-badge" style="fill:#fbbf24;">CREATES</text>
      <text x="795" y="1035" class="rel-card" style="fill:#fbbf24;">1</text>
      <text x="1375" y="1325" class="rel-card" style="fill:#fbbf24;">0..1</text>

      <!-- 7. CUSTOMER_VEHICLES -> SERVICE_JOBS (1:N) -->
      <!-- From (1215, 1140) to (1480, 1240) -->
      <path d="M 1215 1140 L 1215 1200 L 1480 1200 L 1480 1240" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="1345,1185 1390,1200 1345,1215 1300,1200" class="rel-diamond" />
      <text x="1345" y="1200" class="rel-badge">SERVICED</text>
      <text x="1235" y="1160" class="rel-card">1</text>
      <text x="1500" y="1225" class="rel-card">N</text>

      <!-- 8. USERS (Mechanic) -> SERVICE_JOBS (1:N) -->
      <!-- From (160, 560) down to (160, 1420) and right to (1400, 1420) -->
      <path d="M 160 560 L 160 1420 L 1400 1420" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="560,1405 615,1420 560,1435 505,1420" class="rel-diamond" />
      <text x="560" y="1420" class="rel-badge">ASSIGNED</text>
      <text x="180" y="600" class="rel-card">1</text>
      <text x="1375" y="1405" class="rel-card">N</text>

      <!-- 9. SERVICE_JOBS -> JOB_SERVICES (1:N) -->
      <!-- From (1870, 1310) to (2200, 890) -->
      <path d="M 1870 1310 L 2030 1310 L 2030 890 L 2200 890" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="2030,1085 2075,1100 2030,1115 1985,1100" class="rel-diamond" />
      <text x="2030" y="1100" class="rel-badge">PERFORMS</text>
      <text x="1895" y="1295" class="rel-card">1</text>
      <text x="2175" y="875" class="rel-card">N</text>

      <!-- 10. SERVICE_TYPES -> JOB_SERVICES (1:N) -->
      <!-- From (2900, 540) to (2450, 760) -->
      <path d="M 2900 540 L 2900 680 L 2450 680 L 2450 760" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="2675,665 2725,680 2675,695 2625,680" class="rel-diamond" />
      <text x="2675" y="680" class="rel-badge">INCLUDES</text>
      <text x="2920" y="565" class="rel-card">1</text>
      <text x="2470" y="745" class="rel-card">N</text>

      <!-- 11. SERVICE_JOBS -> PART_USAGE (1:N) -->
      <!-- From (1870, 1360) to (2780, 900) -->
      <path d="M 1870 1360 L 2100 1360 L 2100 1020 L 2850 1020 L 2850 1040" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="2475,1005 2525,1020 2475,1035 2425,1020" class="rel-diamond" />
      <text x="2475" y="1020" class="rel-badge">CONSUMES</text>
      <text x="1895" y="1345" class="rel-card">1</text>
      <text x="2870" y="1030" class="rel-card">N</text>

      <!-- 12. SPARE_PARTS -> PART_USAGE (1:N) -->
      <!-- From (2310, 620) to (2970, 760) -->
      <path d="M 2310 620 L 2310 650 L 2970 650 L 2970 760" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="2640,635 2690,650 2640,665 2590,650" class="rel-diamond" />
      <text x="2640" y="650" class="rel-badge">SUPPLIES</text>
      <text x="2330" y="640" class="rel-card">1</text>
      <text x="2990" y="745" class="rel-card">N</text>

      <!-- 13. SERVICE_JOBS -> INVOICES (1:1) -->
      <!-- Vertical direct: From (1635, 1650) to (1635, 1770) -->
      <path d="M 1635 1650 L 1635 1770" fill="none" stroke="#a855f7" stroke-width="3" marker-end="url(#arrow-purple)" />
      <polygon points="1635,1695 1680,1710 1635,1725 1590,1710" class="rel-diamond" style="stroke:#a855f7;" />
      <text x="1635" y="1710" class="rel-badge" style="fill:#d8b4fe;">BILLED AS</text>
      <text x="1655" y="1675" class="rel-card" style="fill:#d8b4fe;">1</text>
      <text x="1655" y="1755" class="rel-card" style="fill:#d8b4fe;">1 (UK)</text>

      <!-- 14. CUSTOMERS -> INVOICES (1:N) -->
      <!-- Along spine x=600 down to y=1840, right to (1420, 1840) -->
      <path d="M 680 590 L 600 590 L 600 1840 L 1420 1840" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="600,1215 645,1230 600,1245 555,1230" class="rel-diamond" />
      <text x="600" y="1230" class="rel-badge">CHARGED</text>
      <text x="620" y="610" class="rel-card">1</text>
      <text x="1395" y="1825" class="rel-card">N</text>

      <!-- 15. INVOICES -> INVOICE_PAYMENTS (1:N) -->
      <!-- Horizontal: From (1420, 1945) left to (1110, 1945) -->
      <path d="M 1420 1945 L 1110 1945" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="1265,1930 1310,1945 1265,1960 1220,1945" class="rel-diamond" />
      <text x="1265" y="1945" class="rel-badge">SETTLED</text>
      <text x="1395" y="1930" class="rel-card">1</text>
      <text x="1135" y="1930" class="rel-card">N</text>

      <!-- 16. USERS (Staff) -> INVOICE_PAYMENTS (1:N) -->
      <!-- From x=100 down to y=1980 right to (680, 1980) -->
      <path d="M 100 560 L 100 1980 L 680 1980" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="390,1965 435,1980 390,1995 345,1980" class="rel-diamond" />
      <text x="390" y="1980" class="rel-badge">RECORDS</text>
      <text x="120" y="600" class="rel-card">1</text>
      <text x="655" y="1965" class="rel-card">N</text>

      <!-- 17. CUSTOMER_VEHICLES -> MAINTENANCE_REMINDERS (1:N) -->
      <!-- From (1050, 1140) to (895, 1270) -->
      <path d="M 1050 1140 L 1050 1220 L 895 1220 L 895 1270" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
      <polygon points="972,1205 1017,1220 972,1235 927,1220" class="rel-diamond" />
      <text x="972" y="1220" class="rel-badge">MONITORS</text>
      <text x="1070" y="1165" class="rel-card">1</text>
      <text x="915" y="1255" class="rel-card">N</text>

      <!-- 18. SERVICE_TYPES -> MAINTENANCE_REMINDERS (1:N) -->
      <!-- From (3000, 540) to (1110, 1420) -->
      <path d="M 3000 540 L 3000 1140 L 1180 1140 L 1180 1420 L 1110 1420" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)" />
      <polygon points="1240,1125 1290,1140 1240,1155 1190,1140" class="rel-diamond" />
      <text x="1240" y="1140" class="rel-badge">PRESCRIBES</text>
      <text x="3020" y="580" class="rel-card">1</text>
      <text x="1135" y="1405" class="rel-card">N</text>

      <!-- 19. USERS -> MAINTENANCE_REMINDERS (1:N) -->
      <path d="M 200 560 L 200 1360 L 680 1360" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)" />
      <text x="220" y="600" class="rel-card">1</text>
      <text x="655" y="1345" class="rel-card">N</text>

      <!-- 20. SERVICE_JOBS -> REPAIR_REPORTS (1:1 Hybrid Document Link) -->
      <!-- From (1870, 1445) to (2150, 1445) -->
      <path d="M 1870 1445 L 2150 1445" fill="none" stroke="#22c55e" stroke-width="3.5" stroke-dasharray="8,6" marker-end="url(#arrow-green)" />
      <polygon points="2010,1430 2055,1445 2010,1460 1965,1445" class="rel-diamond" style="stroke:#22c55e;" />
      <text x="2010" y="1445" class="rel-badge" style="fill:#86efac;">DOCUMENTS</text>
      <text x="1895" y="1430" class="rel-card" style="fill:#86efac;">1</text>
      <text x="2125" y="1430" class="rel-card" style="fill:#86efac;">1</text>
    </svg>

    <!-- ENTITY 1: USERS -->
    <div class="entity-card cat-users" style="left: 60px; top: 230px; width: 380px;">
      <div class="entity-header">
        <span>USERS</span>
        <span class="tag">STRONG ENTITY</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">user_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">full_name</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"><span class="tag-uk">UK</span></td><td class="attr-name">email</td><td class="attr-type">VARCHAR(150)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">password_hash</td><td class="attr-type">VARCHAR(255)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">role</td><td class="attr-type">ENUM(3)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">phone</td><td class="attr-type">VARCHAR(20)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">is_active</td><td class="attr-type">TINYINT(1)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">created_at</td><td class="attr-type">DATETIME</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">updated_at</td><td class="attr-type">DATETIME</td></tr>
      </table>
    </div>

    <!-- ENTITY 2: CUSTOMERS -->
    <div class="entity-card cat-customers" style="left: 660px; top: 230px; width: 400px;">
      <div class="entity-header">
        <span>CUSTOMERS</span>
        <span class="tag">STRONG ENTITY</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">customer_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">full_name</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"><span class="tag-uk">UK</span></td><td class="attr-name">email</td><td class="attr-type">VARCHAR(150)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">phone</td><td class="attr-type">VARCHAR(20)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">address</td><td class="attr-type">TEXT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">city</td><td class="attr-type">VARCHAR(80)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">state</td><td class="attr-type">VARCHAR(80)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">zip_code</td><td class="attr-type">VARCHAR(20)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">created_at</td><td class="attr-type">DATETIME</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">updated_at</td><td class="attr-type">DATETIME</td></tr>
      </table>
    </div>

    <!-- ENTITY 3: VEHICLE_CATALOGUE -->
    <div class="entity-card cat-catalogue" style="left: 1350px; top: 230px; width: 460px;">
      <div class="entity-header">
        <span>VEHICLE_CATALOGUE</span>
        <span class="tag">MASTER DATA</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">catalogue_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">manufacturer</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">model</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">model_year</td><td class="attr-type">SMALLINT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">category</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">fuel / fuel_code</td><td class="attr-type">VARCHAR(100/20)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">engine_type / size</td><td class="attr-type">VARCHAR(50/20)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">transmission_type</td><td class="attr-type">VARCHAR(50)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">drivetrain</td><td class="attr-type">VARCHAR(20)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">conv_economy_combined</td><td class="attr-type">DECIMAL(6,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">electric_range</td><td class="attr-type">DECIMAL(7,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">source_dataset</td><td class="attr-type">ENUM('LDV','AFV','MHD')</td></tr>
      </table>
    </div>

    <!-- ENTITY 4: SPARE_PARTS -->
    <div class="entity-card cat-parts" style="left: 2100px; top: 230px; width: 420px;">
      <div class="entity-header">
        <span>SPARE_PARTS</span>
        <span class="tag">INVENTORY MASTER</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">part_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-uk">UK</span></td><td class="attr-name">part_number</td><td class="attr-type">VARCHAR(60)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">part_name</td><td class="attr-type">VARCHAR(150)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">category / brand</td><td class="attr-type">VARCHAR(80)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">unit_cost</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">selling_price</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">qty_in_stock</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">reorder_level</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">location_code</td><td class="attr-type">VARCHAR(30)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">is_active</td><td class="attr-type">TINYINT(1)</td></tr>
      </table>
    </div>

    <!-- ENTITY 5: SERVICE_TYPES -->
    <div class="entity-card cat-services" style="left: 2780px; top: 230px; width: 400px;">
      <div class="entity-header">
        <span>SERVICE_TYPES</span>
        <span class="tag">OPERATIONS MASTER</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">service_type_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-uk">UK</span></td><td class="attr-name">service_name</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">description</td><td class="attr-type">TEXT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">estimated_duration_mins</td><td class="attr-type">SMALLINT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">base_price</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">is_active</td><td class="attr-type">TINYINT(1)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">created_at</td><td class="attr-type">DATETIME</td></tr>
      </table>
    </div>

    <!-- ENTITY 6: APPOINTMENTS -->
    <div class="entity-card cat-appointments" style="left: 350px; top: 750px; width: 420px;">
      <div class="entity-header">
        <span>APPOINTMENTS</span>
        <span class="tag">TRANSACTIONAL</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">appointment_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">customer_id &rarr; customers</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">vehicle_id &rarr; vehicles</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">advisor_id &rarr; users</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">scheduled_at</td><td class="attr-type">DATETIME</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">status</td><td class="attr-type">ENUM(5)</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">service_type_id &rarr; types</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">mileage_at_booking</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">customer_notes</td><td class="attr-type">TEXT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">advisor_notes</td><td class="attr-type">TEXT</td></tr>
      </table>
    </div>

    <!-- ENTITY 7: CUSTOMER_VEHICLES -->
    <div class="entity-card cat-vehicles" style="left: 1000px; top: 750px; width: 430px;">
      <div class="entity-header">
        <span>CUSTOMER_VEHICLES</span>
        <span class="tag">FLEET REGISTRATION</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">vehicle_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">customer_id &rarr; customers</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">catalogue_id &rarr; catalogue</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">license_plate</td><td class="attr-type">VARCHAR(20)</td></tr>
        <tr><td class="attr-key"><span class="tag-uk">UK</span></td><td class="attr-name">vin</td><td class="attr-type">VARCHAR(17)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">color / purchase_year</td><td class="attr-type">VARCHAR/SMALLINT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">current_odometer</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">fuel_override</td><td class="attr-type">VARCHAR(60)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">is_active</td><td class="attr-type">TINYINT(1)</td></tr>
      </table>
    </div>

    <!-- ENTITY 8: JOB_SERVICES (Associative Bridge) -->
    <div class="entity-card cat-services" style="left: 2200px; top: 760px; width: 380px;">
      <div class="entity-header">
        <span>JOB_SERVICES</span>
        <span class="tag">ASSOCIATIVE (M:N)</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">job_service_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">job_id &rarr; service_jobs</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">service_type_id &rarr; types</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">service_price</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">technician_notes</td><td class="attr-type">TEXT</td></tr>
      </table>
    </div>

    <!-- ENTITY 9: PART_USAGE (Associative Bridge) -->
    <div class="entity-card cat-usage" style="left: 2780px; top: 760px; width: 380px;">
      <div class="entity-header">
        <span>PART_USAGE</span>
        <span class="tag">ASSOCIATIVE (M:N)</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">usage_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">job_id &rarr; service_jobs</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">part_id &rarr; spare_parts</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">qty_used</td><td class="attr-type">SMALLINT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">unit_price_charged</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">used_at</td><td class="attr-type">DATETIME</td></tr>
      </table>
    </div>

    <!-- ENTITY 10: SERVICE_JOBS (Central Hub) -->
    <div class="entity-card cat-jobs" style="left: 1400px; top: 1240px; width: 470px;">
      <div class="entity-header">
        <span>SERVICE_JOBS</span>
        <span class="tag">WORKSHOP EXECUTION HUB</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">job_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">appointment_id &rarr; appointments</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">mechanic_id &rarr; users</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">vehicle_id &rarr; customer_vehicles</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">status</td><td class="attr-type">ENUM(5)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">odometer_in / odometer_out</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">started_at / completed_at</td><td class="attr-type">DATETIME</td></tr>
        <tr><td class="attr-key"><span class="tag-fk" style="background:#22c55e; color:#000;">DOC</span></td><td class="attr-name attr-fk" style="color:#86efac;">mongo_report_id &rarr; repair_reports._id</td><td class="attr-type">VARCHAR(24)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">internal_notes</td><td class="attr-type">TEXT</td></tr>
      </table>
    </div>

    <!-- ENTITY 11: MAINTENANCE_REMINDERS -->
    <div class="entity-card cat-reminders" style="left: 680px; top: 1270px; width: 430px;">
      <div class="entity-header">
        <span>MAINTENANCE_REMINDERS</span>
        <span class="tag">PREDICTIVE AUTOMATION</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">reminder_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">vehicle_id &rarr; customer_vehicles</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">service_type_id &rarr; types</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">reminder_type</td><td class="attr-type">ENUM('date','mileage','interval')</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">next_service_date</td><td class="attr-type">DATE</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">next_service_odometer</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">interval_km / interval_days</td><td class="attr-type">INT / SMALLINT</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">is_sent / is_active</td><td class="attr-type">TINYINT(1)</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">created_by &rarr; users</td><td class="attr-type">INT UNSIGNED</td></tr>
      </table>
    </div>

    <!-- ENTITY 12: REPAIR_REPORTS (MongoDB Document Collection) -->
    <div class="entity-card cat-mongo" style="left: 2150px; top: 1240px; width: 460px;">
      <div class="entity-header">
        <span>autocare_db.repair_reports</span>
        <span class="tag" style="background:#22c55e; color:#000;">MONGODB JSON SCHEMA</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk" style="background:#22c55e; color:#000;">_id</span></td><td class="attr-name attr-pk" style="color:#86efac;">_id (Document ObjectId)</td><td class="attr-type">ObjectId (BSON)</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">job_id &rarr; MySQL service_jobs</td><td class="attr-type">int (Required)</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">vehicle_id &rarr; customer_vehicles</td><td class="attr-type">int (Required)</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">mechanic_id &rarr; users</td><td class="attr-type">int (Required)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">mileage_at_service</td><td class="attr-type">int</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">findings [ ] (Polymorphic System Array)</td><td class="attr-type">Array&lt;Object&gt;</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">&bull; system, condition, action, rec</td><td class="attr-type">Subdocument</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">parts_replaced [ ] (Part Id & Qty)</td><td class="attr-type">Array&lt;Object&gt;</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">overall_health_score (0 - 100)</td><td class="attr-type">int (Validator)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">photo_urls [ ] / test_drive_notes</td><td class="attr-type">Array&lt;String&gt; / text</td></tr>
      </table>
    </div>

    <!-- ENTITY 13: INVOICES -->
    <div class="entity-card cat-invoices" style="left: 1420px; top: 1770px; width: 440px;">
      <div class="entity-header">
        <span>INVOICES</span>
        <span class="tag">FINANCIAL BILLING</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">invoice_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span><span class="tag-uk" style="margin-left:2px;">UK</span></td><td class="attr-name attr-fk" style="color:#d8b4fe;">job_id &rarr; service_jobs (1:1)</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">customer_id &rarr; customers</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">subtotal</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">tax_rate / tax_amount</td><td class="attr-type">DECIMAL(5,2 / 10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">discount_amount</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">total_amount</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">status</td><td class="attr-type">ENUM(5)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">due_date / issued_at</td><td class="attr-type">DATE / DATETIME</td></tr>
      </table>
    </div>

    <!-- ENTITY 14: INVOICE_PAYMENTS -->
    <div class="entity-card cat-payments" style="left: 680px; top: 1770px; width: 430px;">
      <div class="entity-header">
        <span>INVOICE_PAYMENTS</span>
        <span class="tag">PAYMENT SETTLEMENT</span>
      </div>
      <table class="attr-table">
        <tr><td class="attr-key"><span class="tag-pk">PK</span></td><td class="attr-name attr-pk">payment_id</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">invoice_id &rarr; invoices</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">amount_paid</td><td class="attr-type">DECIMAL(10,2)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">payment_method</td><td class="attr-type">ENUM(6)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">reference_number</td><td class="attr-type">VARCHAR(100)</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">paid_at</td><td class="attr-type">DATETIME</td></tr>
        <tr><td class="attr-key"><span class="tag-fk">FK</span></td><td class="attr-name attr-fk">recorded_by &rarr; users</td><td class="attr-type">INT UNSIGNED</td></tr>
        <tr><td class="attr-key"></td><td class="attr-name">notes</td><td class="attr-type">TEXT</td></tr>
      </table>
    </div>

  </div>

</body>
</html>
"""

html_path = os.path.join(docs_dir, 'AutoCare_Insight_ER_Diagram.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)
print(f"Generated {html_path}")

# Output JPEGs in docs/ and database/
out_jpegs = [
    os.path.join(docs_dir, 'AutoCare_Insight_ER_Diagram.jpeg'),
    os.path.join(docs_dir, 'AutoCare_Insight_ER_Diagram.jpg'),
    os.path.join(db_dir, 'AutoCare_Insight_ER_Diagram.jpeg'),
    os.path.join(db_dir, 'AutoCare_Insight_ER_Diagram.jpg'),
]

success = render_html_to_jpeg(html_path, out_jpegs, width=3600, height=2450)
print("ER Diagram rendering result:", success)
