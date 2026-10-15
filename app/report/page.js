import ReportView from '@/components/report/ReportView';

export const metadata = {
  title: 'บันทึกและแชร์ผล · Personality Type Explorer',
  description: 'บันทึกและแชร์สรุปผลบุคลิกภาพหนึ่งหน้า เป็น PNG หรือ PDF',
};

export default async function ReportPage({searchParams}) {
  const params=await searchParams;
  return <ReportView key={JSON.stringify(params)} />;
}
