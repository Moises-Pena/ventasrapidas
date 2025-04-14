import React, { useRef } from 'react';
import { Sale } from '../types';
import { format } from 'date-fns';
import { Printer, Settings } from 'lucide-react';

interface ReceiptProps {
  sale: Sale;
  onClose: () => void;
}

// Función que genera y maneja la impresión del recibo de la venta
export const printReceipt = (sale: Sale): void => {
  // Crea un div temporal para contener el contenido del recibo
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <div class="receipt-paper">
      <div class="header">
        <h3 class="text-lg font-bold">VENTA RÁPIDA</h3>
        <p>Recibo de Venta</p>
        <p>${format(new Date(sale.timestamp), 'dd/MM/yyyy HH:mm:ss')}</p>
        <p>No. ${sale.id}</p>
        <p>Cliente: ${sale.customerName || 'Venta al contado'}</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="items">
        ${sale.items.map(item => `
          <div class="item">
            <div style="max-width: 70%; word-wrap: break-word">
              <span>${item.quantity}x </span>
              <span>${item.product.name}</span>
            </div>
            <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="divider"></div>
      
      <div class="total">
        <div class="item">
          <span>TOTAL:</span>
          <span>$${sale.total.toFixed(2)}</span>
        </div>
        <div class="item">
          <span>PAGADO:</span>
          <span>$${sale.amountPaid.toFixed(2)}</span>
        </div>
        <div class="item">
          <span>CAMBIO:</span>
          <span>$${sale.change.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="footer">
        <p>¡Gracias por su compra!</p>
      </div>
    </div>
  `;

  // Crea un iframe temporal para realizar la impresión
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) return;

  printDocument.write(`
    <html>
      <head>
        <title>Recibo de Venta</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            margin: 0;
            padding: 10px;
            width: 300px;
          }
          .receipt-paper {
            width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total {
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        ${tempDiv.innerHTML}
      </body>
    </html>
  `);

  printDocument.close();

  // Espera a que el contenido se cargue en el iframe
  iframe.onload = () => {
    // Abre el cuadro de diálogo de impresión nativo
    iframe.contentWindow?.print();

    // Elimina el iframe después de la impresión
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };
};

// Componente que renderiza el recibo de venta y permite imprimirlo o cerrarlo
const Receipt: React.FC<ReceiptProps> = ({ sale, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Manejador de evento para imprimir el recibo
  const handlePrint = () => {
    printReceipt(sale);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
          <h2 className="text-lg font-medium">Recibo de Venta</h2>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-white text-blue-500 hover:bg-blue-50"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            <span className="text-sm">Imprimir</span>
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div ref={receiptRef} className="receipt-paper">
            <div className="header">
              <h3 className="text-lg font-bold">VENTA RÁPIDA</h3>
              <p>Recibo de Venta</p>
              <p>{format(new Date(sale.timestamp), 'dd/MM/yyyy HH:mm:ss')}</p>
              <p>No. {sale.id}</p>
              <p>Cliente: {sale.customerName || 'Venta al contado'}</p>
            </div>
            
            <div className="divider"></div>
            
            <div className="items">
              {sale.items.map((item, index) => (
                <div key={index} className="item">
                  <div style={{ maxWidth: '70%', wordWrap: 'break-word' }}>
                    <span>{item.quantity}x </span>
                    <span>{item.product.name}</span>
                  </div>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="divider"></div>
            
            <div className="total">
              <div className="item">
                <span>TOTAL:</span>
                <span>${sale.total.toFixed(2)}</span>
              </div>
              <div className="item">
                <span>PAGADO:</span>
                <span>${sale.amountPaid.toFixed(2)}</span>
              </div>
              <div className="item">
                <span>CAMBIO:</span>
                <span>${sale.change.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="footer">
              <p>¡Gracias por su compra!</p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
