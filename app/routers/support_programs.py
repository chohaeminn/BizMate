import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SupportProgram
from app.schemas import (
    SupportProgramCreate,
    SupportProgramResponse,
    SupportProgramUpdate,
)


router = APIRouter(
    prefix="/support-programs",
    tags=["Support Programs"],
)


@router.post(
    "",
    response_model=SupportProgramResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_support_program(
    support_program_data: SupportProgramCreate,
    db: Session = Depends(get_db),
):
    support_program = SupportProgram(
        **support_program_data.model_dump()
    )

    db.add(support_program)
    db.commit()
    db.refresh(support_program)

    return support_program


@router.get(
    "",
    response_model=list[SupportProgramResponse],
)
def get_support_programs(
    db: Session = Depends(get_db),
):
    statement = select(SupportProgram).order_by(
        SupportProgram.created_at.desc()
    )

    support_programs = db.scalars(statement).all()

    return support_programs


@router.get(
    "/{program_id}",
    response_model=SupportProgramResponse,
)
def get_support_program(
    program_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    support_program = db.get(
        SupportProgram,
        program_id,
    )

    if support_program is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="지원사업 정보를 찾을 수 없습니다.",
        )

    return support_program


@router.patch(
    "/{program_id}",
    response_model=SupportProgramResponse,
)
def update_support_program(
    program_id: uuid.UUID,
    support_program_data: SupportProgramUpdate,
    db: Session = Depends(get_db),
):
    support_program = db.get(
        SupportProgram,
        program_id,
    )

    if support_program is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="지원사업 정보를 찾을 수 없습니다.",
        )

    update_data = support_program_data.model_dump(
        exclude_unset=True
    )

    for field_name, field_value in update_data.items():
        setattr(
            support_program,
            field_name,
            field_value,
        )

    db.commit()
    db.refresh(support_program)

    return support_program


@router.delete(
    "/{program_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_support_program(
    program_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    support_program = db.get(
        SupportProgram,
        program_id,
    )

    if support_program is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="지원사업 정보를 찾을 수 없습니다.",
        )

    db.delete(support_program)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )