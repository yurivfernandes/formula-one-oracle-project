
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StandardTableProps {
  title: string;
  subtitle?: string;
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

const StandardTable: React.FC<StandardTableProps> = ({
  title,
  subtitle,
  headers,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-red-200 overflow-hidden shadow-xl ${className}`}
    >
      <div className="p-3 sm:p-6 border-b border-red-100 bg-white">
        <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-1 sm:mb-2">{title}</h2>
        {subtitle && <p className="text-sm sm:text-base text-gray-600">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-red-100 bg-white">
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  className="text-red-700 font-bold uppercase tracking-wider bg-white text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">{children}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StandardTable;
