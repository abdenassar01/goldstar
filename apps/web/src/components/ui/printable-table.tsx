import React from 'react'
import type { Doc } from '@goldstart/backend/convex/_generated/dataModel'

type Item = Doc<'items'> & {
  mark: Doc<'marks'> | null
  category: Doc<'categories'> | null
}

interface PrintableTableProps {
  title: string
  subtitle?: string
  className?: string
  children: React.ReactNode
}

export const PrintableTable = ({ title, subtitle, className = '', children }: PrintableTableProps) => {
  return (
    <div className={`printable-table ${className}`}>
      <style>{`
        @media print {
          .printable-table {
            width: 100%;
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #333;
          }
          
          .print-subtitle {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          
          .print-table th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
          }
          
          .print-table td {
            font-size: 10px;
          }
          
          .print-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          
          /* Hide non-printable elements */
          .no-print {
            display: none !important;
          }
        }
        
        @media screen {
          .printable-table {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
          }
          
          .print-title {
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 8px 0;
            color: #1f2937;
          }
          
          .print-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
            vertical-align: top;
          }
          
          .print-table th {
            background-color: #f9fafb;
            font-weight: 600;
            font-size: 14px;
            color: #374151;
          }
          
          .print-table td {
            font-size: 14px;
            color: #1f2937;
          }
          
          .print-table tr:hover {
            background-color: #f3f4f6;
          }
          
          .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
        }
      `}</style>
      
      <div className="print-header">
        <h1 className="print-title">{title}</h1>
        {subtitle && <p className="print-subtitle">{subtitle}</p>}
      </div>
      
      {children}
      
      <div className="print-footer">
        <p>Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
      </div>
    </div>
  )
}

interface ItemsTableProps {
  items: Item[]
  title?: string
}

export const PrintableItemsTable = ({ items, title = "Liste des Articles" }: ItemsTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${items.length} article(s) au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Marque</th>
            <th>Catégorie</th>
            <th>Variantes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.mark?.name || 'N/A'}</td>
              <td>{item.category?.name || 'N/A'}</td>
              <td>
                {item.variants?.map(v => `${v.name}: ${v.price} DH`).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

interface MarksTableProps {
  marks: Doc<'marks'>[]
  title?: string
}

export const PrintableMarksTable = ({ marks, title = "Liste des Marques" }: MarksTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${marks.length} marque(s) au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((mark) => (
            <tr key={mark._id}>
              <td>{mark.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

interface CategoriesTableProps {
  categories: Doc<'categories'>[]
  title?: string
}

export const PrintableCategoriesTable = ({ categories, title = "Liste des Catégories" }: CategoriesTableProps) => {
  return (
    <PrintableTable 
      title={title} 
      subtitle={`${categories.length} catégorie(s) au total`}
    >
      <table className="print-table">
        <thead>
          <tr>
            <th>Nom</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintableTable>
  )
}

export const printCurrentPage = () => {
  window.print()
}