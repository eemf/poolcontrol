'use client';

import { ShieldCheck, Users, Trash2 } from 'lucide-react';
import { SurfaceCard, PillTabs, ModalConfirmacion, BotonVolverArriba } from '@/components/comunes';
import { EncabezadoPermisos } from './_components/EncabezadoPermisos';
import { ListadoRoles } from './_components/ListadoRoles';
import { SeccionPersonal } from './_components/SeccionPersonal';
import { ModalRol } from './_components/ModalRol';
import { usePermisosConfig } from './_hooks/use-permisos-config';

/**
 * Página de configuración de roles y asignación de permisos al personal de la sucursal.
 */
export default function PaginaGestionPermisos() {
  const {
    activeTab,
    setActiveTab,
    roles,
    usuarios,
    cargandoRoles,
    cargandoUsuarios,
    isRolModalOpen,
    editingRol,
    rolToDelete,
    setRolToDelete,
    loading,
    modalForm,
    abrirNuevoRol,
    abrirEditarRol,
    manejarGuardarRol,
    confirmarEliminarRol,
    toggleRolAUsuario,
    handleCloseModal,
  } = usePermisosConfig();

  return (
    <div className="space-y-4 sm:space-y-6">
      <EncabezadoPermisos onNuevoRol={abrirNuevoRol} />

      <SurfaceCard variant="panel" className="p-4 sm:p-5 space-y-4 font-body">
        <PillTabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            {
              id: 'roles',
              label: 'Roles de Usuario',
              icon: ShieldCheck,
              count: roles?.length || 0,
              badgeVariant: activeTab === 'roles' ? 'white' : 'sky',
            },
            {
              id: 'usuarios',
              label: 'Personal de Sucursal',
              icon: Users,
              count: usuarios?.length || 0,
              badgeVariant: activeTab === 'usuarios' ? 'white' : 'slate',
            },
          ]}
        />

        {activeTab === 'roles' ? (
          <ListadoRoles
            roles={roles}
            cargando={cargandoRoles}
            onEditar={abrirEditarRol}
            onEliminar={setRolToDelete}
          />
        ) : (
          <SeccionPersonal
            usuarios={usuarios}
            roles={roles}
            onToggleRol={toggleRolAUsuario}
            cargando={cargandoUsuarios}
          />
        )}
      </SurfaceCard>

      <ModalRol
        abierto={isRolModalOpen || !!editingRol}
        onClose={handleCloseModal}
        editando={!!editingRol}
        onSubmit={manejarGuardarRol}
        procesando={loading}
        form={modalForm}
      />

      <ModalConfirmacion
        open={!!rolToDelete}
        onOpenChange={(o) => !o && setRolToDelete(null)}
        tipo="destructivo"
        swalTipo="error"
        titulo="¿Eliminar rol?"
        subtitulo={`Esta acción eliminará el rol "${rolToDelete?.nombre || ''}" y sus permisos asociados en esta sucursal.`}
        textoCancelar="Cancelar"
        textoConfirmar="Sí, eliminar"
        iconoConfirmar={Trash2}
        procesando={loading}
        onConfirmar={confirmarEliminarRol}
      />

      <BotonVolverArriba threshold={150} />
    </div>
  );
}
