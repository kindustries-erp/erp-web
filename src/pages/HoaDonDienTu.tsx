import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Download, RefreshCw, Send, Trash2 } from 'lucide-react';

const HoaDonDienTu: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Mock data for PLAN mode visualization
  const mockInvoices = [
    { id: '1', doc_no: 'HD001', invoice_no: 'AA/23E000123', date: '2026-05-14', customer: 'Công ty A', amount: 15000000, status: 'ISSUED' },
    { id: '2', doc_no: 'HD002', invoice_no: '', date: '2026-05-14', customer: 'Công ty B', amount: 5000000, status: 'DRAFT' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hóa đơn điện tử</h1>
          <p className="text-muted-foreground text-sm">Quản lý và phát hành hóa đơn SInvoice Viettel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Đồng bộ
          </Button>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" /> Phát hành hóa đơn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đã phát hành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chờ ký</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bị hủy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã chứng từ</TableHead>
                <TableHead>Số hóa đơn</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.doc_no}</TableCell>
                  <TableCell>{inv.invoice_no || '-'}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.customer}</TableCell>
                  <TableCell className="text-right">{inv.amount.toLocaleString()} đ</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === 'ISSUED' ? 'default' : 'secondary'}>
                      {inv.status === 'ISSUED' ? 'Đã phát hành' : 'Bản nháp'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Tải PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Hủy hóa đơn" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HoaDonDienTu;
