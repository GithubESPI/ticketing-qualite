'use client';

import { AlertCircle, CheckCircle, Clock, User, Calendar, Star, MessageSquare } from 'lucide-react';
import { Ticket } from '../hooks/useTickets';

interface TicketCardProps {
  ticket: Ticket;
  index: number;
}

export default function TicketCard({ ticket, index }: TicketCardProps) {
  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('terminé') || s.includes('done') || s.includes('closed')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (s.includes('cours') || s.includes('progress')) {
      return <Clock className="w-5 h-5 text-blue-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-orange-500" />;
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p.includes('haute') || p.includes('high')) return 'bg-red-100 text-red-800 border-red-200';
    if (p.includes('moyenne') || p.includes('medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getPriorityIcon = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p.includes('haute') || p.includes('high')) return <Star className="w-3 h-3 fill-current" />;
    return <Star className="w-3 h-3" />;
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('terminé') || s.includes('done')) return 'text-green-600 bg-green-50';
    if (s.includes('cours') || s.includes('progress')) return 'text-blue-600 bg-blue-50';
    if (s.includes('nouveau') || s.includes('new')) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 group animate-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* En-tête du ticket */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon(ticket.status)}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {ticket.id || ticket.key || `TICKET-${index + 1}`}
            </h3>
            <p className="text-gray-600 mt-1 font-medium">
              {ticket.summary || ticket.title || 'Sans titre'}
            </p>
          </div>
        </div>
        
        {/* Badge de priorité */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
          {getPriorityIcon(ticket.priority)}
          {ticket.priority || 'Normal'}
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
            {ticket.description}
          </p>
        </div>
      )}

      {/* Métadonnées du ticket */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <User className="w-4 h-4" />
          <span className="font-medium">{ticket.assignee || ticket.assigned_to || 'Non assigné'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{ticket.created || ticket.created_date || 'N/A'}</span>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
          <span>{ticket.status || 'Nouveau'}</span>
        </div>
      </div>

      {/* Actions rapides (au survol) */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors">
            <MessageSquare className="w-3 h-3" />
            Commenter
          </button>
          <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors">
            <CheckCircle className="w-3 h-3" />
            Marquer terminé
          </button>
        </div>
      </div>

      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
