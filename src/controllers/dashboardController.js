import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { Lead } from "../models/Lead.js";
import { FinanceApplication } from "../models/FinanceApplication.js";
import { CibilCheck } from "../models/CibilCheck.js";
import { Product } from "../models/Product.js";
import { UsedVehicle } from "../models/UsedVehicle.js";
import { ComparisonEvent } from "../models/ComparisonEvent.js";

export const dashboard = asyncHandler(async (_req, res) => {
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);

  const [
    totalLeads,
    newLeadsToday,
    totalFinance,
    totalCibil,
    activeProducts,
    activeUsed,
    leadsOverTime,
    comparisonOverTime,
    latestLeads,
    latestCibil,
    latestEnquiries,
    financeStatus,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ created_at: { $gte: todayStart } }),
    FinanceApplication.countDocuments(),
    CibilCheck.countDocuments(),
    Product.countDocuments({ is_active: true }),
    UsedVehicle.countDocuments({ is_active: true }),
    // leads over last 14 days
    Lead.aggregate([
      { $match: { created_at: { $gte: new Date(Date.now() - 14*24*60*60*1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    ComparisonEvent.aggregate([
      { $match: { created_at: { $gte: new Date(Date.now() - 14*24*60*60*1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Lead.find({}).sort({ created_at: -1 }).limit(10),
    CibilCheck.find({}).sort({ checked_at: -1 }).limit(10),
    Lead.find({}).sort({ created_at: -1 }).limit(10),
    FinanceApplication.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  return ok(res, {
    cards: {
      total_leads: totalLeads,
      new_leads_today: newLeadsToday,
      finance_applications: totalFinance,
      cibil_checks: totalCibil,
      products_active: activeProducts,
      used_vehicles_active: activeUsed,
    },
    charts: {
      leads_over_time: leadsOverTime,
      product_comparison_usage: comparisonOverTime,
      finance_applications_status: financeStatus,
    },
    recent_activity: {
      latest_10_leads: latestLeads,
      latest_10_cibil_checks: latestCibil,
      latest_10_enquiries: latestEnquiries,
    },
  });
});
