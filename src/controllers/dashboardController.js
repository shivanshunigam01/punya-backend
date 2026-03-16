import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

import { Lead } from "../models/Lead.js";
import { FinanceApplication } from "../models/FinanceApplication.js";
import { CibilCheck } from "../models/CibilCheck.js";
import Product from "../models/Product.js";
import { UsedVehicle } from "../models/UsedVehicle.js";
import VisitLog from "../models/VisitLog.js"; // 🔥 REQUIRED (explained below)

/* =====================================================
   1️⃣ DASHBOARD STATS (TOP CARDS)
===================================================== */
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalLeads,
    newLeadsToday,
    financeApplications,
    cibilChecks,
    activeProducts,
    activeUsedVehicles,
    totalVisitors,
    todayVisitors,
    uniqueVisitors,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ created_at: { $gte: todayStart } }),
    FinanceApplication.countDocuments(),
    CibilCheck.countDocuments(),
    Product.countDocuments({ is_active: true }),
    UsedVehicle.countDocuments({ is_active: true }),

    VisitLog.countDocuments(),
    VisitLog.countDocuments({ created_at: { $gte: todayStart } }),
    VisitLog.distinct("ip_address").then(r => r.length),
  ]);

  return ok(res, {
    totalLeads,
    newLeadsToday,
    financeApplications,
    cibilChecks,
    activeProducts,
    activeUsedVehicles,
    totalVisitors,
    todayVisitors,
    uniqueVisitors,
  });
});

/* =====================================================
   2️⃣ RECENT LEADS
===================================================== */
export const getRecentLeads = asyncHandler(async (_req, res) => {
  const leads = await Lead.find({})
    .sort({ created_at: -1 })
    .limit(10);

  const mapped = leads.map(l => ({
    id: l._id,
    customerName: l.customer_name,
    productName: l.product_interest,
    brand: l.brand_interest,
    status: l.status,
    createdAt: l.created_at,
  }));

  return ok(res, mapped);
});

/* =====================================================
   3️⃣ LEADS OVER TIME (AREA CHART)
===================================================== */
export const getLeadsOverTime = asyncHandler(async (_req, res) => {
  const data = await Lead.aggregate([
    {
      $match: {
        created_at: {
          $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%b", date: "$created_at" },
        },
        leads: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return ok(
    res,
    data.map(d => ({ date: d._id, leads: d.leads }))
  );
});

/* =====================================================
   4️⃣ FINANCE STATUS (PIE CHART)
===================================================== */
export const getFinanceStatus = asyncHandler(async (_req, res) => {
  const stats = await FinanceApplication.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const colorMap = {
    approved: "hsl(var(--success))",
    under_review: "hsl(var(--warning))",
    rejected: "hsl(var(--destructive))",
    pending: "hsl(var(--info))",
    disbursed: "hsl(var(--primary))",
  };

  return ok(
    res,
    stats.map(s => ({
      status: s._id,
      count: s.count,
      fill: colorMap[s._id] || "hsl(var(--muted))",
    }))
  );
});

/* =====================================================
   5️⃣ WEBSITE TRAFFIC (LINE CHART)
===================================================== */
// export const getWebsiteTraffic = asyncHandler(async (_req, res) => {
// const traffic = await Traffic.aggregate([
//   {
//     $group: {
//       _id: {
//         $dateToString: {
//           format: "%Y-%m-%d", // ✅ SAFE
//           date: "$created_at"
//         }
//       },
//       visitors: { $sum: 1 }
//     }
//   },
//   { $sort: { _id: 1 } },
//   { $limit: 7 }
// ]);

// res.json({
//   data: traffic.map(t => ({
//     date: t._id,
//     visitors: t.visitors
//   }))
// });


//   const totalVisitors = await VisitLog.countDocuments();
//   const todayVisitors = await VisitLog.countDocuments({
//     created_at: {
//       $gte: new Date(new Date().setHours(0, 0, 0, 0)),
//     },
//   });
//   const uniqueVisitors = (await VisitLog.distinct("ip_address")).length;

//   return ok(res, {
//     totalVisitors,
//     todayVisitors,
//     uniqueVisitors,
//     trafficTrend: traffic.map(t => ({
//       date: t._id,
//       visitors: t.visitors,
//     })),
//   });
// });


export const getWebsiteTraffic = asyncHandler(async (_req, res) => {
  const traffic = await VisitLog.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$created_at"
          }
        },
        visitors: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 7 }
  ]);

  const totalVisitors = await VisitLog.countDocuments();

  const todayVisitors = await VisitLog.countDocuments({
    created_at: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });

  const uniqueVisitors = (await VisitLog.distinct("ip_address")).length;

  return ok(res, {
    totalVisitors,
    todayVisitors,
    uniqueVisitors,
    trafficTrend: traffic.map(t => ({
      date: t._id,
      visitors: t.visitors
    }))
  });
});