'use client';

import { CalendarClock } from 'lucide-react';
import { BotonVolverArriba, PageHeader } from '@/components/comunes';
import { useSuscripcionesAdmin } from './_hooks/use-suscripciones-admin';
import { ListaSuscripciones } from './_components/ListaSuscripciones';
import { ModalesSuscripcion } from './_components/ModalesSuscripcion';

export default function PaginaSuscripcionesMaestra() {
    const admin = useSuscripcionesAdmin();

    return (
        <div className="space-y-6 font-body">
            <PageHeader
                title="Gestión de Suscripciones"
                description="Administra el acceso, pagos y vigencia de todas las sucursales."
                icon={CalendarClock}
            />

            <ListaSuscripciones
                sucursales={admin.filteredSucursales}
                isLoading={admin.isLoading}
                searchTerm={admin.searchTerm}
                onSearchChange={admin.setSearchTerm}
                filtroEstado={admin.filtroEstado}
                onFiltroEstadoChange={admin.setFiltroEstado}
                counts={admin.counts}
                onOpenPago={admin.handleOpenPago}
                onOpenHistorial={admin.setSucursalParaHistorial}
                onToggleSuspension={(s, m) => admin.setSucursalToSuspend({ s, m })}
                onOpenEdit={admin.handleOpenEdit}
            />

            <ModalesSuscripcion
                loading={admin.loading}
                sucursalParaPago={admin.sucursalParaPago}
                onClosePago={() => admin.setSucursalParaPago(null)}
                pagoMeses={admin.pagoMeses}
                setPagoMeses={admin.setPagoMeses}
                pagoMonto={admin.pagoMonto}
                setPagoMonto={admin.setPagoMonto}
                pagoMetodo={admin.pagoMetodo}
                setPagoMetodo={admin.setPagoMetodo}
                onRegistrarPago={admin.handleRegistrarPago}
                sucursalParaHistorial={admin.sucursalParaHistorial}
                onCloseHistorial={() => admin.setSucursalParaHistorial(null)}
                historialPagos={admin.historialPagos}
                isLoadingHistorial={admin.isLoadingHistorial}
                editingSucursal={admin.editingSucursal}
                onCloseEdit={() => admin.setEditingSucursal(null)}
                plan={admin.plan}
                setPlan={admin.setPlan}
                estado={admin.estado}
                setEstado={admin.setEstado}
                monto={admin.monto}
                setMonto={admin.setMonto}
                vencimientoStr={admin.vencimientoStr}
                setVencimientoStr={admin.setVencimientoStr}
                onExtendOneMonth={admin.extendOneMonth}
                onUpdate={admin.handleUpdate}
                sucursalToSuspend={admin.sucursalToSuspend}
                onCloseSuspend={() => admin.setSucursalToSuspend(null)}
                onToggleSuspension={admin.handleToggleSuspension}
            />

            <BotonVolverArriba threshold={150} />
        </div>
    );
}
