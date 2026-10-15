import ReportView from '@/components/report/ReportView';

export const metadata = {
  title: 'สรุปผล · Personality Type Explorer',
  description: 'สรุปบุคลิกภาพหนึ่งหน้า พร้อม 4 มิติ จุดเด่น และ Growth tips',
};

export default async function ReportPage({searchParams}) {
  const params=await searchParams;
  return <ReportView key={JSON.stringify(params)} />;
}
